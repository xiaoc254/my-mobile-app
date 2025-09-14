import { useNavigate } from "react-router-dom";
import { Grid, Swiper } from "antd-mobile";
import catImg from "../image/cat.jpg";
import dogImg from "../image/dog.jpg";
import img1 from "../image/1.png";

export default function Home() {
  const navigate = useNavigate();

  const carouselImages = [
    {
      src: catImg,
      title: "可爱猫咪",
    },
    {
      src: dogImg,
      title: "忠诚小狗",
    },
    {
      src: img1,
      title: "萌宠世界",
    },
  ];

  const featureItems = [
    {
      icon: "😊",
      title: "健康监测",
      bgColor: "#fff",
      onClick: () => navigate("/health-monitor"),
    },
    {
      icon: "!",
      title: "安全预警",
      bgColor: "#fff",
      onClick: () => navigate("/ai"),
    },
    {
      icon: "☕",
      title: "科学食谱",
      bgColor: "#fff",
      onClick: () => navigate("/pet-recipe-select"),
    },
  ];

  const newsItems = [
    {
      image: catImg,
      title: "猫猫私人的五种表现意味着你",
      type: "health",
    },
    {
      image: dogImg,
      title: "狗狗大科普小知识狗狗为什么是短腿?",
      type: "knowledge",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* Header Carousel */}
      <div style={{ height: "250px", position: "relative" }}>
        <Swiper
          autoplay
          loop
          indicator={(total, current) => (
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "4px",
              }}
            >
              {Array.from({ length: total }, (_, index) => (
                <div
                  key={index}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor:
                      current === index ? "#fff" : "rgba(255,255,255,0.5)",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          )}
          style={{ height: "100%" }}
        >
          {carouselImages.map((item, index) => (
            <Swiper.Item key={index}>
              <div
                style={{
                  height: "250px",
                  background: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${item.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: "20px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    marginBottom: "40px",
                  }}
                >
                  {item.title}
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* Feature Icons */}
      <div style={{ padding: "20px" }}>
        <Grid columns={3} gap={20}>
          {featureItems.map((item, index) => (
            <Grid.Item key={index}>
              <div
                onClick={item.onClick}
                style={{
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: item.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontSize: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "2px solid #d4994b",
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}
                >
                  {item.title}
                </div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* Main Feature Card */}
      <div style={{ margin: "20px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #d4994b 0%, #c8955a 100%)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            minHeight: "120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ flex: 1, color: "white" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: "1.4",
              }}
            >
              为守护宠物
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: "1.4",
              }}
            >
              成长路上的
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: "1.4",
              }}
            >
              每一步
            </div>
          </div>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: `url(${dogImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "3px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>
      </div>

      {/* Science Pet Care Section */}
      <div style={{ padding: "0 20px", marginTop: "30px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
              margin: "0 0 5px 0",
            }}
          >
            科学养宠
          </h2>
          <p style={{ fontSize: "14px", color: "#999", margin: 0 }}>
            守护毛孩子健康成长
          </p>
        </div>

        {/* News Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {newsItems.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "80px",
                  background: `url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }}
              />
              <div style={{ padding: "12px", flex: 1 }}>
                <div
                  style={{ fontSize: "14px", color: "#333", lineHeight: "1.4" }}
                >
                  {item.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
