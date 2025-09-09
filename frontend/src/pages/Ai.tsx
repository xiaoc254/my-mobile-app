import { useState } from "react";
import { Card, Button, TextArea, List } from "antd-mobile";

interface ChatMessage {
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
}

export default function Ai() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            type: "ai",
            content: "你好！我是智能宠物助手，有什么关于宠物的问题可以问我哦～",
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "user",
            content: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText("");

        // 模拟AI回复
        setTimeout(() => {
            const aiReply: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: "ai",
                content: "这是一个很好的问题！根据我的知识，建议您...",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiReply]);
        }, 1000);
    };

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            paddingBottom: "60px"
        }}>
            <Card style={{
                flex: 1,
                margin: "10px",
                display: "flex",
                flexDirection: "column"
            }}>
                <h2 style={{ textAlign: "center", margin: "10px 0" }}>
                    🤖 AI宠物助手
                </h2>

                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    marginBottom: "20px"
                }}>
                    <List>
                        {messages.map(message => (
                            <List.Item
                                key={message.id}
                                prefix={
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            backgroundColor: message.type === "ai" ? "#1890ff" : "#52c41a",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "16px"
                                        }}
                                    >
                                        {message.type === "ai" ? "🤖" : "👤"}
                                    </div>
                                }
                                description={message.timestamp.toLocaleTimeString()}
                            >
                                <div style={{
                                    padding: "8px 12px",
                                    backgroundColor: message.type === "ai" ? "#f0f0f0" : "#e6f7ff",
                                    borderRadius: "8px",
                                    marginLeft: message.type === "user" ? "40px" : "0"
                                }}>
                                    {message.content}
                                </div>
                            </List.Item>
                        ))}
                    </List>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <TextArea
                        value={inputText}
                        onChange={setInputText}
                        placeholder="请输入您的问题..."
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        style={{ flex: 1 }}
                    />
                    <Button
                        color="primary"
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                    >
                        发送
                    </Button>
                </div>
            </Card>
        </div>
    );
}
