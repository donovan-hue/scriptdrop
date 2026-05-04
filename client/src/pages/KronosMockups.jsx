import { useState } from "react";

const screens = [
  "splash",
  "login",
  "feed",
  "chat",
  "shop",
  "food",
  "cinema",
  "profile",
  "admin",
  "miniapps",
];

const screenNames = {
  splash: "Splash",
  login: "Login",
  feed: "Feed Social",
  chat: "Chat",
  shop: "Tienda",
  food: "Food Delivery",
  cinema: "Cinema",
  profile: "Perfil",
  admin: "Admin",
  miniapps: "Mini Apps",
};

function Phone({ children, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: 320,
          height: 640,
          borderRadius: 36,
          background: "#0a0a12",
          border: "3px solid #333",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 20px 60px rgba(120,80,255,0.15), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 28,
            background: "#0a0a12",
            borderRadius: "0 0 16px 16px",
            zIndex: 50,
          }}
        />
        <div
          style={{
            height: 44,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 20px 4px",
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            position: "relative",
            zIndex: 40,
          }}
        >
          <span>9:41</span>
          <span style={{ display: "flex", gap: 4 }}>
            <span>📶</span>
            <span>🔋</span>
          </span>
        </div>
        <div style={{ height: 596, overflow: "auto" }}>{children}</div>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          fontFamily: "'Outfit', sans-serif",
          color: "#999",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function HoloText({ children, size = 28, style = {} }) {
  return (
    <div
      style={{
        fontSize: size,
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        background: "linear-gradient(135deg, #7c3aed, #06b6d4, #a855f7, #3b82f6, #ec4899)",
        backgroundSize: "300% 300%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: 2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function GlassCard({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BottomNav({ active }) {
  const items = [
    { icon: "🏠", label: "Inicio" },
    { icon: "🛒", label: "Tienda" },
    { icon: "💬", label: "Chat" },
    { icon: "🍔", label: "Food" },
    { icon: "👤", label: "Perfil" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(10,10,18,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0 8px",
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 9,
            color: active === i ? "#a855f7" : "rgba(255,255,255,0.4)",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 20 }}>{it.icon}</span>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function SplashScreen() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.15), transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(6,182,212,0.1), transparent 50%), #06060e",
        position: "relative",
      }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            borderRadius: "50%",
            background: `hsl(${200 + i * 30}, 80%, 70%)`,
            opacity: 0.3,
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
        />
      ))}
      <HoloText size={42}>KRONOS</HoloText>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 8, letterSpacing: 3, fontFamily: "'Outfit', sans-serif" }}>
        SUPER APP
      </div>
      <div style={{ marginTop: 48, width: 40, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #7c3aed, #06b6d4)", opacity: 0.6 }} />
    </div>
  );
}

function LoginScreen() {
  return (
    <div
      style={{
        height: "100%",
        background: "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.12), transparent 50%), #08080f",
        padding: "60px 24px 24px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <HoloText size={32} style={{ textAlign: "center" }}>KRONOS</HoloText>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>
        Inicia sesión
      </div>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        <input
          placeholder="Email"
          readOnly
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "14px 16px",
            color: "#fff",
            fontSize: 14,
            outline: "none",
            fontFamily: "'Outfit', sans-serif",
          }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          readOnly
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "14px 16px",
            color: "#fff",
            fontSize: 14,
            outline: "none",
            fontFamily: "'Outfit', sans-serif",
          }}
        />
        <div
          style={{
            marginTop: 8,
            padding: "14px 0",
            borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4)",
            textAlign: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: 1,
          }}
        >
          ENTRAR
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {["Google", "Apple", "GitHub"].map((p) => (
            <div
              key={p}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "auto", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
        ¿No tienes cuenta? <span style={{ color: "#a855f7" }}>Regístrate</span>
      </div>
    </div>
  );
}

function FeedScreen() {
  const posts = [
    { user: "María", time: "2m", text: "Probando los filtros de IA 🔥", likes: 234, type: "image" },
    { user: "Carlos", time: "15m", text: "Video desde Cancún", likes: 89, type: "video" },
    { user: "Ana", time: "1h", text: "Nuevo track disponible 🎵", likes: 512, type: "audio" },
  ];
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <HoloText size={18}>Feed</HoloText>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <span style={{ fontSize: 18 }}>✨</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "8px 16px", overflowX: "auto" }}>
        {["Tu historia", "María", "Carlos", "Ana", "Luis"].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: i === 0 ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, hsl(${250 + i * 30},70%,60%), hsl(${200 + i * 20},80%,50%))`,
                border: i === 0 ? "2px dashed rgba(255,255,255,0.15)" : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: i === 0 ? 20 : 14,
                color: "#fff",
              }}
            >
              {i === 0 ? "+" : n[0]}
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((p, i) => (
          <GlassCard key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${250+i*40},70%,60%), hsl(${200+i*30},80%,50%))` }} />
                <div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{p.user}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{p.time}</div>
                </div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>⋯</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>{p.text}</div>
            <div
              style={{
                height: 120,
                borderRadius: 10,
                background: p.type === "video"
                  ? "linear-gradient(135deg, #1a1a3e, #0d2137)"
                  : p.type === "audio"
                  ? "linear-gradient(135deg, #1a0d2e, #2a1040)"
                  : "linear-gradient(135deg, #0f172a, #1e1040)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 10,
              }}
            >
              {p.type === "video" ? "▶" : p.type === "audio" ? "🎵" : "🖼"}
            </div>
            <div style={{ display: "flex", gap: 16, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              <span>❤️ {p.likes}</span>
              <span>💬 12</span>
              <span>🔄 5</span>
            </div>
          </GlassCard>
        ))}
      </div>
      <BottomNav active={0} />
    </div>
  );
}

function ChatScreen() {
  const chats = [
    { name: "Grupo Kronos", msg: "Carlos: Listo el deploy ✅", time: "ahora", unread: 3 },
    { name: "Ana García", msg: "Te envié el archivo", time: "5m", unread: 1 },
    { name: "Soporte", msg: "Tu ticket fue resuelto", time: "1h", unread: 0 },
    { name: "María López", msg: "🎬 Sala de cine activa", time: "2h", unread: 0 },
    { name: "Dev Team", msg: "PR aprobado 🚀", time: "3h", unread: 5 },
  ];
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <HoloText size={18}>Mensajes</HoloText>
        <span style={{ fontSize: 18 }}>✏️</span>
      </div>
      <div style={{ padding: "4px 16px" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
          🔍 Buscar conversación...
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {chats.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${240+i*25},60%,50%), hsl(${190+i*20},70%,45%))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>
              {c.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{c.name}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{c.time}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Outfit', sans-serif" }}>{c.msg}</div>
            </div>
            {c.unread > 0 && (
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>
                {c.unread}
              </div>
            )}
          </div>
        ))}
      </div>
      <BottomNav active={2} />
    </div>
  );
}

function ShopScreen() {
  const products = [
    { name: "Headset VR", price: "$299", cat: "Tech" },
    { name: "Kronos Hoodie", price: "$59", cat: "Merch" },
    { name: "NFT Pack #12", price: "0.5 ETH", cat: "Digital" },
    { name: "Drone X1", price: "$449", cat: "Tech" },
  ];
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <HoloText size={18}>Tienda</HoloText>
        <span style={{ fontSize: 18 }}>🛒</span>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "4px 16px", overflowX: "auto" }}>
        {["Todo", "Tech", "Merch", "Digital", "AR"].map((c, i) => (
          <div key={i} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap",
            background: i === 0 ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.04)",
            color: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
            border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
          }}>{c}</div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {products.map((p, i) => (
          <GlassCard key={i} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              height: 100, background: `linear-gradient(135deg, hsl(${240+i*20},40%,15%), hsl(${200+i*25},50%,12%))`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            }}>
              {i === 0 ? "🥽" : i === 1 ? "👕" : i === 2 ? "🎨" : "🛸"}
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ color: "#a855f7", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{p.price}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{p.cat}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <BottomNav active={1} />
    </div>
  );
}

function FoodScreen() {
  const restaurants = [
    { name: "Sushi Kronos", time: "25 min", rating: 4.8, cat: "Japonés" },
    { name: "Burger Lab", time: "15 min", rating: 4.5, cat: "Burgers" },
    { name: "Taco Nebula", time: "20 min", rating: 4.9, cat: "Mexicano" },
  ];
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px" }}>
        <HoloText size={18}>Food Delivery</HoloText>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2, fontFamily: "'Outfit', sans-serif" }}>📍 Tu ubicación</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 16px" }}>
        {["🍣 Sushi", "🍔 Burgers", "🌮 Tacos", "🍕 Pizza"].map((c, i) => (
          <div key={i} style={{
            padding: "10px 12px", borderRadius: 12, fontSize: 11, fontFamily: "'Outfit', sans-serif",
            background: i === 0 ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${i === 0 ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)"}`,
            color: i === 0 ? "#c084fc" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap",
          }}>{c}</div>
        ))}
      </div>
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {restaurants.map((r, i) => (
          <GlassCard key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, hsl(${250+i*30},40%,18%), hsl(${200+i*20},50%,14%))`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            }}>
              {i === 0 ? "🍣" : i === 1 ? "🍔" : "🌮"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{r.name}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>{r.cat}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11 }}>
                <span style={{ color: "#facc15" }}>⭐ {r.rating}</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>🕐 {r.time}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <BottomNav active={3} />
    </div>
  );
}

function CinemaScreen() {
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <HoloText size={18}>Cinema</HoloText>
        <span style={{ fontSize: 18 }}>🎬</span>
      </div>
      <div style={{ padding: "0 16px" }}>
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            height: 160,
            background: "linear-gradient(135deg, #1a0a3e, #0d1f3d, #0a2530)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          }}>
            <div style={{ fontSize: 48 }}>▶</div>
            <div style={{ position: "absolute", bottom: 10, left: 14, right: 14 }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Sala: Sci-Fi Night</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>12 personas viendo · En vivo</div>
            </div>
          </div>
        </GlassCard>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>Salas activas</div>
        {["Anime Marathon · 8 👥", "Música en vivo · 23 👥", "Documentales · 5 👥"].map((s, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'Outfit', sans-serif",
          }}>
            <span>{s}</span>
            <span style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 10,
              background: "rgba(124,58,237,0.15)", color: "#a855f7",
            }}>Unirse</span>
          </div>
        ))}
      </div>
      <BottomNav active={0} />
    </div>
  );
}

function ProfileScreen() {
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{
        height: 100,
        background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15), rgba(168,85,247,0.1))",
      }} />
      <div style={{ padding: "0 16px", marginTop: -36, textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, border: "3px solid #08080f",
        }}>👤</div>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginTop: 8, fontFamily: "'Outfit', sans-serif" }}>@usuario_kronos</div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>Nivel 12 · Premium</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
          {[["Posts", "142"], ["Seguidores", "2.3K"], ["Siguiendo", "890"]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          ["🪙", "Kronos Tokens", "1,250 KRN"],
          ["🎨", "IA Generativa", ""],
          ["📊", "Analytics", ""],
          ["🌐", "Web3 Wallet", ""],
          ["⚙️", "Configuración", ""],
        ].map(([icon, label, val]) => (
          <GlassCard key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>{label}</span>
            <span style={{ color: "#a855f7", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>{val || "›"}</span>
          </GlassCard>
        ))}
      </div>
      <BottomNav active={4} />
    </div>
  );
}

function AdminScreen() {
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px" }}>
        <HoloText size={18}>Admin Panel</HoloText>
      </div>
      <div style={{ padding: "4px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          ["👥", "Usuarios", "12,430"],
          ["📝", "Posts", "89,201"],
          ["🚩", "Reportes", "23"],
          ["💰", "Revenue", "$34K"],
        ].map(([icon, label, val]) => (
          <GlassCard key={label} style={{ textAlign: "center", padding: "16px 10px" }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>{val}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{label}</div>
          </GlassCard>
        ))}
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>Acciones rápidas</div>
        {["Moderar contenido", "Gestionar usuarios", "Ver analytics", "Configurar tokens"].map((a, i) => (
          <div key={i} style={{
            padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'Outfit', sans-serif",
            display: "flex", justifyContent: "space-between",
          }}>
            <span>{a}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniAppsScreen() {
  const apps = [
    { icon: "🧮", name: "Calculadora" },
    { icon: "📝", name: "Notas" },
    { icon: "📈", name: "Stocks" },
    { icon: "⏱", name: "Timer" },
    { icon: "🌐", name: "Traductor" },
    { icon: "🌤", name: "Clima" },
    { icon: "🤖", name: "IA Chat" },
    { icon: "👁", name: "AR View" },
    { icon: "🪙", name: "Tokens" },
  ];
  return (
    <div style={{ height: "100%", background: "#08080f", position: "relative" }}>
      <div style={{ padding: "8px 16px" }}>
        <HoloText size={18}>Mini Apps</HoloText>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>Herramientas integradas</div>
      </div>
      <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {apps.map((a, i) => (
          <GlassCard key={i} style={{ textAlign: "center", padding: "18px 8px" }}>
            <div style={{ fontSize: 28 }}>{a.icon}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>{a.name}</div>
          </GlassCard>
        ))}
      </div>
      <BottomNav active={0} />
    </div>
  );
}

const screenComponents = {
  splash: SplashScreen,
  login: LoginScreen,
  feed: FeedScreen,
  chat: ChatScreen,
  shop: ShopScreen,
  food: FoodScreen,
  cinema: CinemaScreen,
  profile: ProfileScreen,
  admin: AdminScreen,
  miniapps: MiniAppsScreen,
};

export default function KronosMockups() {
  const [view, setView] = useState("grid");
  const [single, setSingle] = useState("splash");

  return (
    <div style={{ minHeight: "100vh", background: "#04040a", padding: "32px 16px", fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <HoloText size={36}>KRONOS</HoloText>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4, letterSpacing: 2 }}>DISEÑO DE PANTALLAS</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          <button
            onClick={() => setView("grid")}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
              background: view === "grid" ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.06)",
              color: "#fff", fontFamily: "'Outfit', sans-serif",
            }}
          >Vista Grid</button>
          <button
            onClick={() => setView("single")}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
              background: view === "single" ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.06)",
              color: "#fff", fontFamily: "'Outfit', sans-serif",
            }}
          >Vista Individual</button>
        </div>
      </div>

      {view === "single" && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          {screens.map((s) => (
            <button
              key={s}
              onClick={() => setSingle(s)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11,
                background: single === s ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
                color: single === s ? "#c084fc" : "rgba(255,255,255,0.4)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >{screenNames[s]}</button>
          ))}
        </div>
      )}

      {view === "grid" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
          {screens.map((s) => {
            const Comp = screenComponents[s];
            return (
              <Phone key={s} label={screenNames[s]}>
                <Comp />
              </Phone>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Phone label={screenNames[single]}>
            {(() => { const C = screenComponents[single]; return <C />; })()}
          </Phone>
        </div>
      )}
    </div>
  );
}
