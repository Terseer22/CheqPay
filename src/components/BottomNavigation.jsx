import {
  Home,
  BarChart3,
  Gift,
  User
} from "lucide-react";
import '../styles/bottom.css'

const navigation = [
  { name: "Home", icon: Home, page: "mobilehome" },
  { name: "Finance", icon: BarChart3, page: "fund" },
  { name: "Reward", icon: Gift, page: "reward" },
  { name: "Me", icon: User, page: "profile" }
];

const BottomNavigation = ({ page, setPage }) => {
  return (
    <nav className="mobile-bottom-nav">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = page === item.page;
        return (
          <button
            key={item.name}
            onClick={() => setPage(item.page)}
            className={`bottom-item ${isActive ? "active" : ""}`}
          >
            <div className="icon-wrap">
              <Icon size={22} strokeWidth={isActive ? 2.6 : 2} />
            </div>
            <span>{item.name}</span>
            {isActive && <div className="active-dot" />}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;