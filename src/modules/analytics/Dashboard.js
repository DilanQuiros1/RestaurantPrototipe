import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  TableChart as TableChartIcon,
  GetApp as GetAppIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  Restaurant as RestaurantIcon,
  Stars as StarsIcon,
} from "@mui/icons-material";
import KPISection from "./KPISection";
import Charts from "./Charts";
import AdvancedTrends from "./AdvancedTrends";
import ReportsTable from "./ReportsTable";
import Filters from "./Filters";
import ExportButtons from "./ExportButtons";
import LoyaltyAnalytics from "./LoyaltyAnalytics";
import CashAnalysis from "./CashAnalysis";
import {
  generateMockData,
  calculateKPIs,
  generateChartData,
  getComparisonData,
} from "../../data/mockMetricsData";
import "./Dashboard.css";

const drawerWidth = 280;

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [data, setData] = useState({ orders: [], products: [] });
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    category: "",
    paymentMethod: "",
  });
  const [kpis, setKpis] = useState({});
  const [chartData, setChartData] = useState({});
  const [comparisonData, setComparisonData] = useState({});

  // Inicializar datos mock
  useEffect(() => {
    const mockData = generateMockData();
    setData(mockData);
    setFilteredData(mockData.orders);

    // Calcular KPIs iniciales
    const todayKPIs = calculateKPIs(mockData.orders, "today");
    const weekKPIs = calculateKPIs(mockData.orders, "week");
    const monthKPIs = calculateKPIs(mockData.orders, "month");

    setKpis({ today: todayKPIs, week: weekKPIs, month: monthKPIs });

    // Generar datos de gráficos
    const salesChart = generateChartData(mockData.orders, "sales", "week");
    const categoriesChart = generateChartData(mockData.orders, "categories");
    const paymentChart = generateChartData(mockData.orders, "payment");

    setChartData({
      sales: salesChart,
      categories: categoriesChart,
      payment: paymentChart,
    });

    // Datos de comparación
    const comparison = getComparisonData(mockData.orders, "week");
    setComparisonData(comparison);
  }, []);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular nuevas órdenes cada 30 segundos
      if (Math.random() > 0.7) {
        const mockData = generateMockData();
        setData(mockData);

        // Recalcular KPIs
        const todayKPIs = calculateKPIs(mockData.orders, "today");
        const weekKPIs = calculateKPIs(mockData.orders, "week");
        const monthKPIs = calculateKPIs(mockData.orders, "month");

        setKpis({ today: todayKPIs, week: weekKPIs, month: monthKPIs });

        // Actualizar gráficos
        const salesChart = generateChartData(mockData.orders, "sales", "week");
        const categoriesChart = generateChartData(
          mockData.orders,
          "categories"
        );
        const paymentChart = generateChartData(mockData.orders, "payment");

        setChartData({
          sales: salesChart,
          categories: categoriesChart,
          payment: paymentChart,
        });
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Aplicar filtros y recalcular métricas en tiempo real
  useEffect(() => {
    let filtered = [...data.orders];

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.date);
        return (
          orderDate >= filters.dateRange.start &&
          orderDate <= filters.dateRange.end
        );
      });
    }

    if (filters.category) {
      filtered = filtered.filter((order) =>
        order.items.some((item) => item.category === filters.category)
      );
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(
        (order) => order.paymentMethod === filters.paymentMethod
      );
    }

    setFilteredData(filtered);

    // Recalcular KPIs con datos filtrados
    const todayKPIs = calculateKPIs(filtered, "today");
    const weekKPIs = calculateKPIs(filtered, "week");
    const monthKPIs = calculateKPIs(filtered, "month");

    setKpis({ today: todayKPIs, week: weekKPIs, month: monthKPIs });

    // Recalcular datos de gráficos con datos filtrados
    const salesChart = generateChartData(filtered, "sales", "week");
    const categoriesChart = generateChartData(filtered, "categories");
    const paymentChart = generateChartData(filtered, "payment");

    setChartData({
      sales: salesChart,
      categories: categoriesChart,
      payment: paymentChart,
    });

    // Recalcular datos de comparación con datos filtrados
    const comparison = getComparisonData(filtered, "week");
    setComparisonData(comparison);
  }, [filters, data.orders]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const menuItems = [
    { id: "dashboard", text: "Dashboard", icon: <DashboardIcon /> },
    { id: "analytics", text: "Análisis", icon: <AssessmentIcon /> },
    { id: "loyalty", text: "Programa Lealtad", icon: <StarsIcon /> },
    { id: "reports", text: "Reportes", icon: <TableChartIcon /> },
    { id: "trends", text: "Tendencias", icon: <TrendingUpIcon /> },
    { id: "export", text: "Exportar", icon: <GetAppIcon /> },
  ];

  const drawer = (
    <div className="sidebar">
      <div className="sidebar-header">
        <RestaurantIcon sx={{ fontSize: 40, color: "#1976d2" }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Analytics Pro
        </Typography>
      </div>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeView === item.id}
              onClick={() => setActiveView(item.id)}
              className={
                activeView === item.id ? "sidebar-item-active" : "sidebar-item"
              }
            >
              <ListItemIcon
                sx={{ color: activeView === item.id ? "#1976d2" : "#666" }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: activeView === item.id ? "#1976d2" : "#333" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            <KPISection kpis={kpis} comparisonData={comparisonData} orders={filteredData} />
            <Box sx={{ mt: 3 }}>
              <Charts data={chartData} />
            </Box>
          </>
        );
      case "analytics":
        return <CashAnalysis />;
      case "loyalty":
        return <LoyaltyAnalytics />;
      case "reports":
        return (
          <>
            <Filters onFilterChange={handleFilterChange} filters={filters} />
            <Box sx={{ mt: 3 }}>
              <ReportsTable data={filteredData} />
            </Box>
          </>
        );
      case "trends":
        return (
          <AdvancedTrends 
            data={data} 
            onFilterChange={handleFilterChange} 
            filters={filters}
          />
        );
      case "export":
        return (
          <>
            <Filters onFilterChange={handleFilterChange} filters={filters} />
            <Box sx={{ mt: 3 }}>
              <ExportButtons data={filteredData} kpis={kpis} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <ReportsTable data={filteredData} />
            </Box>
          </>
        );
      default:
        return (
          <KPISection
            kpis={kpis}
            comparisonData={comparisonData}
            orders={filteredData}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            {menuItems.find((item) => item.id === activeView)?.text ||
              "Dashboard"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Última actualización: {new Date().toLocaleTimeString("es-ES")}
          </Typography>
        </Toolbar>
      </AppBar> */}

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="xl">{renderContent()}</Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
