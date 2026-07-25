# 局域网聊天应用

基于 Tauri 2.0 + WebSocket 的跨平台聊天客户端，支持 Windows 和 macOS。

## 项目结构

```
exe/
├── chat-server/    # WebSocket 聊天服务器（Rust）
└── chat-client/    # Tauri 桌面客户端（React + Rust）
```

## 快速开始

### 1. 启动服务器（一台电脑）

```bash
cd chat-server
cargo run
```

启动后会显示本机地址，例如：
```
本机地址: ws://192.168.1.100:8080
```

### 2. 启动客户端（每台电脑）

```bash
cd chat-client
npx tauri dev
```

### 3. 开始聊天

在客户端连接面板中：
- **用户 ID**：填一个唯一标识，如 `user-tom`
- **昵称**：显示给对方的名字，如 `Tom`
- **服务器地址**：填服务器的地址，如 `ws://192.168.1.100:8080`

双方连接后，一方发消息，消息会自动出现在对方的联系人列表中。

## 打包分发

### 打包客户端

```bash
cd chat-client
npx tauri build
```

产物位置：
- macOS: `src-tauri/target/release/bundle/dmg/Chat_Client_0.1.0_aarch64.dmg`
- Windows: `src-tauri/target/release/bundle/msi/Chat_Client_0.1.0_x64.msi`

### 打包服务器

```bash
cd chat-server
cargo build --release
```

产物：`target/release/chat-server`（单文件，直接运行）

## 工作原理

```
┌──────────────┐      WebSocket       ┌──────────────────┐      WebSocket       ┌──────────────┐
│   客户端 A    │ ◄──────────────────► │   聊天服务器       │ ◄──────────────────► │   客户端 B    │
│  (Tauri App) │                      │  (chat-server)   │                      │  (Tauri App) │
└──────────────┘                      └──────────────────┘                      └──────────────┘
```

1. 客户端连接服务器，发送注册消息（user_id + user_name）
2. 客户端 A 发消息给 B，消息带 `to: "user-b"`
3. 服务器根据 `to` 找到 B 的连接，转发消息
4. B 收到消息，显示在聊天窗口

## 技术栈

- **客户端**: Tauri 2.0 + React 19 + TypeScript + TailwindCSS 4 + Zustand
- **服务器**: Rust + tokio + tokio-tungstenite
- **通信**: WebSocket + JSON 协议
