use std::collections::HashMap;
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
use std::thread;

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::net::TcpStream as TokioTcpStream;
use tokio::sync::mpsc;
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ChatMessage {
    id: String,
    #[serde(rename = "type")]
    msg_type: String,
    from: String,
    to: String,
    content: String,
    timestamp: i64,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    file_meta: Option<FileMeta>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FileMeta {
    name: String,
    size: u64,
    mime_type: String,
    chunks: u32,
}

#[derive(Debug, Deserialize)]
struct Register {
    user_id: String,
    user_name: String,
}

type Tx = mpsc::UnboundedSender<Message>;
type Users = Arc<Mutex<HashMap<String, (String, Tx)>>>;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "0.0.0.0:8080";
    let listener = TcpListener::bind(addr)?;
    let local_ip = local_ip_address::local_ip()?;
    println!("╔══════════════════════════════════════════════════╗");
    println!("║          Chat Server 启动成功!                    ║");
    println!("╠══════════════════════════════════════════════════╣");
    println!("║  本机地址: ws://{: <30} ║", format!("{}:8080", local_ip));
    println!("║  本地地址: ws://127.0.0.1:8080                    ║");
    println!("╠══════════════════════════════════════════════════╣");
    println!("║  将上方地址告诉对方，让对方客户端连接即可开始聊天   ║");
    println!("╚══════════════════════════════════════════════════╝");

    let users: Users = Arc::new(Mutex::new(HashMap::new()));

    for stream in listener.incoming() {
        let stream = stream?;
        stream.set_nonblocking(true)?;
        let users = users.clone();

        thread::spawn(move || {
            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .unwrap();
            rt.block_on(async {
                let stream = TokioTcpStream::from_std(stream).unwrap();
                handle_connection(stream, users).await;
            });
        });
    }

    Ok(())
}

async fn handle_connection(stream: TokioTcpStream, users: Users) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            println!("[!] WebSocket 握手失败: {}", e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    let forward_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // 等待注册
    let user_id = loop {
        let msg = ws_receiver.next().await;
        match msg {
            Some(Ok(Message::Text(text))) => {
                if let Ok(reg) = serde_json::from_str::<Register>(&text) {
                    let mut users_guard = users.lock().unwrap();
                    let join_notice = ChatMessage {
                        id: uuid::Uuid::new_v4().to_string(),
                        msg_type: "system".into(),
                        from: "system".into(),
                        to: "all".into(),
                        content: format!("{} ({}) 上线了", reg.user_name, reg.user_id),
                        timestamp: chrono::Utc::now().timestamp_millis(),
                        status: "sent".into(),
                        file_meta: None,
                    };
                    let notice_json = serde_json::to_string(&join_notice).unwrap();
                    for (_, (_, sender)) in users_guard.iter() {
                        let _ = sender.send(Message::text(&notice_json));
                    }
                    println!("[+] 用户注册: {} ({})", reg.user_id, reg.user_name);
                    let uid = reg.user_id.clone();
                    users_guard.insert(reg.user_id, (reg.user_name, tx.clone()));
                    break uid;
                } else {
                    println!("[!] 首条消息不是注册消息，断开");
                    drop(tx);
                    return;
                }
            }
            Some(Ok(Message::Close(_))) | None => {
                drop(tx);
                return;
            }
            Some(Err(e)) => {
                println!("[!] 消息错误: {}", e);
                drop(tx);
                return;
            }
            _ => {}
        }
    };

    // 接收循环
    while let Some(result) = ws_receiver.next().await {
        match result {
            Ok(Message::Text(text)) => {
                match serde_json::from_str::<ChatMessage>(&text) {
                    Ok(mut msg) => {
                        msg.status = "delivered".into();
                        let json = serde_json::to_string(&msg).unwrap();
                        let users_guard = users.lock().unwrap();
                        if let Some((_, sender)) = users_guard.get(&msg.to) {
                            let _ = sender.send(Message::text(&json));
                            println!("  📨 {} -> {}: {}", msg.from, msg.to,
                                if msg.content.len() > 30 { format!("{}...", &msg.content[..30]) } else { msg.content.clone() });
                        } else {
                            println!("  ✗ {} 不在线", msg.to);
                        }
                    }
                    Err(e) => println!("[!] 消息解析失败: {}", e),
                }
            }
            Ok(Message::Close(_)) => break,
            Err(e) => { println!("[!] 连接错误 {}: {}", user_id, e); break; }
            _ => {}
        }
    }

    let mut users_guard = users.lock().unwrap();
    users_guard.remove(&user_id);
    println!("[-] 用户下线: {}", user_id);
    drop(tx);
    let _ = forward_task.await;
}
