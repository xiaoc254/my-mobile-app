import { useState } from "react";
import { Card, Button, Image, List, Tag, Space } from "antd-mobile";

interface Pet {
    id: string;
    name: string;
    breed: string;
    age: string;
    image: string;
    weight: string;
    health: string;
}

export default function Pet() {
    const [pets] = useState<Pet[]>([
        {
            id: "1",
            name: "小白",
            breed: "荷兰兔",
            age: "6个月",
            image: "https://via.placeholder.com/100x100/FFF/000?text=🐰",
            weight: "1.2kg",
            health: "健康"
        }
    ]);

    return (
        <div style={{ padding: "20px", paddingBottom: "60px" }}>
            <Card>
                <h2 style={{ textAlign: "center", margin: "20px 0" }}>
                    🐾 我的宠物
                </h2>

                {pets.length > 0 ? (
                    <List>
                        {pets.map(pet => (
                            <List.Item
                                key={pet.id}
                                prefix={
                                    <Image
                                        src={pet.image}
                                        width={60}
                                        height={60}
                                        style={{ borderRadius: "50%" }}
                                    />
                                }
                                description={
                                    <Space direction="vertical" style={{ fontSize: "12px" }}>
                                        <div>品种: {pet.breed} | 年龄: {pet.age}</div>
                                        <div>体重: {pet.weight}</div>
                                        <Tag color={pet.health === "健康" ? "success" : "warning"}>
                                            {pet.health}
                                        </Tag>
                                    </Space>
                                }
                            >
                                {pet.name}
                            </List.Item>
                        ))}
                    </List>
                ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <p>还没有添加宠物信息</p>
                    </div>
                )}

                <div style={{ marginTop: "20px" }}>
                    <Button color="primary" block>
                        添加宠物
                    </Button>
                </div>
            </Card>
        </div>
    );
}
