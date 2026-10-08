import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("vehicareUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("vehicareUser");
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("vehicareTheme") === "dark");

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("vehicareTheme", next ? "dark" : "light");
      return next;
    });
  }

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [scheduleRecords, setScheduleRecords] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const maintenance = maintenanceRecords.length;
  const schedules = scheduleRecords.length;
  const expenses = 0;

  // =========================
  // GET USER VEHICLES
  // =========================

  useEffect(() => {
    if (!user) {
      setVehicles([]);
      return;
    }

    fetchVehicles(user.id);
    fetchMaintenance(user.id);
    fetchSchedules(user.id);
    fetchNotifications(user.id);
  }, [user]);

  async function fetchNotifications(userId) {
    setLoadingNotifications(true);
    try {
      const response = await fetch(
        `http://localhost/vehicare-api/api.php?action=get_notifications&user_id=${userId}`
      );
      const data = await response.json();
      setNotifications(data.success && Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function fetchSchedules(userId) {
    setLoadingSchedules(true);
    try {
      const response = await fetch(
        `http://localhost/vehicare-api/api.php?action=get_schedules&user_id=${userId}`
      );
      const data = await response.json();
      setScheduleRecords(data.success && Array.isArray(data.schedules) ? data.schedules : []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setScheduleRecords([]);
    } finally {
      setLoadingSchedules(false);
    }
  }

  async function fetchMaintenance(userId) {
    setLoadingMaintenance(true);
    try {
      const response = await fetch(
        `http://localhost/vehicare-api/api.php?action=get_maintenance&user_id=${userId}`
      );
      const data = await response.json();
      setMaintenanceRecords(data.success && Array.isArray(data.maintenance) ? data.maintenance : []);
    } catch (error) {
      console.error("Error fetching maintenance:", error);
      setMaintenanceRecords([]);
    } finally {
      setLoadingMaintenance(false);
    }
  }

  async function fetchVehicles(userId) {
    setLoadingVehicles(true);

    try {
      const response = await fetch(
        `http://localhost/vehicare-api/api.php?action=get_vehicles&user_id=${userId}`
      );

      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  }

  const vehicleCount = vehicles.length;

  // =========================
  // LOGIN
  // =========================

  function handleLogin(loginUser) {
    localStorage.setItem(
      "vehicareUser",
      JSON.stringify(loginUser)
    );

    setUser(loginUser);
    setPage("dashboard");
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    localStorage.removeItem("vehicareUser");
    setUser(null);
    setVehicles([]);
    setPage("dashboard");
  }

  // =========================
  // AUTH PAGE
  // =========================

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // =========================
  // MAIN APP
  // =========================

  return (
    <div className={`app${darkMode ? " theme-dark" : ""}`}>

      {/* TOP NAVBAR */}

      <header className="top-navbar">

        <div className="brand">

          <div className="brand-icon">
            <i className="bi bi-car-front-fill"></i>
          </div>

          <div>
            <div className="brand-name">
              Vehicare
            </div>

            <div className="brand-subtitle">
              Vehicle Maintenance Management
            </div>
          </div>

        </div>


        <div className="user-section">

          <button
            type="button"
            className="theme-icon-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            title={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            <i className={`bi ${darkMode ? "bi-sun-fill" : "bi-moon-stars-fill"}`}></i>
          </button>

          <button
            type="button"
            className="notification-icon notification-button"
            onClick={() => setPage("notifications")}
            aria-label={`Open notifications, ${notifications.filter((item) => Number(item.is_read) !== 1).length} unread`}
            title="Open notifications"
          >
            <i className="bi bi-bell-fill"></i>
            <span>{notifications.filter((item) => Number(item.is_read) !== 1).length}</span>
          </button>


          <button
            type="button"
            className="profile-trigger"
            aria-label="Open profile"
            onClick={() => setPage("profile")}
          >
            <span className="user-avatar">{getInitials(user.name)}</span>
            <span className="user-info">
              <strong>Hello, {user.name}</strong>
              <small>Vehicle Owner</small>
            </span>
          </button>


          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>

        </div>

      </header>


      {/* MAIN LAYOUT */}

      <div className="main-layout">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="sidebar-label">
            MAIN MENU
          </div>


          {[
            {
              id: "dashboard",
              icon: "bi bi-pie-chart-fill",
              label: "Dashboard",
            },
            {
              id: "vehicles",
              icon: "bi bi-car-front-fill",
              label: "Vehicles",
            },
            {
              id: "maintenance",
              icon: "bi bi-tools",
              label: "Maintenance",
            },
            {
              id: "schedules",
              icon: "bi bi-calendar-check-fill",
              label: "Schedules",
            },
            {
              id: "notifications",
              icon: "bi bi-bell-fill",
              label: "Notifications",
            },
            {
              id: "profile",
              icon: "bi bi-person-circle",
              label: "Profile",
            },
          ].map((item) => (

            <button
              type="button"
              key={item.id}
              className={`sidebar-btn ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => setPage(item.id)}
            >

              <span className="sidebar-icon">
                <i className={item.icon}></i>
              </span>

              <span className="sidebar-text">
                {item.label}
              </span>

              {item.id === "notifications" && (
                <span className="menu-badge">
                  0
                </span>
              )}

            </button>

          ))}


          <div className="sidebar-bottom">

            <div className="help-box">

              <div className="help-icon">
                <i className="bi bi-car-front-fill"></i>
              </div>

              <strong>
                Vehicare System v1.0
              </strong>

              <p>
                Preventive maintenance management
                for your vehicles.
              </p>

            </div>

          </div>

        </aside>


        {/* CONTENT */}

        <main className="content">

          {/* DASHBOARD */}

          {page === "dashboard" && (
            <Dashboard
              vehicles={vehicleCount}
              maintenance={maintenance}
              schedules={schedules}
              expenses={expenses}
              setPage={setPage}
              loadingVehicles={loadingVehicles}
            />
          )}


          {/* VEHICLES */}

          {page === "vehicles" && (
            <VehiclesPage
              vehicles={vehicles}
              loadingVehicles={loadingVehicles}
              onRefresh={() => fetchVehicles(user.id)}
              onAddVehicle={async (vehicle) => {
                const response = await fetch(
                  "http://localhost/vehicare-api/api.php?action=add_vehicle",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...vehicle, user_id: user.id }),
                  }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                  throw new Error(data.message || "Could not add vehicle.");
                }
                await fetchVehicles(user.id);
              }}
            />
          )}


          {/* MAINTENANCE */}

          {page === "maintenance" && (
            <MaintenancePage
              vehicles={vehicles}
              records={maintenanceRecords}
              loading={loadingMaintenance}
              onRefresh={() => fetchMaintenance(user.id)}
              onAddMaintenance={async (record) => {
                const response = await fetch(
                  "http://localhost/vehicare-api/api.php?action=add_maintenance",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...record, user_id: user.id }),
                  }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                  throw new Error(data.message || "Could not save maintenance record.");
                }
                await fetchMaintenance(user.id);
              }}
            />
          )}


          {/* SCHEDULES */}

          {page === "schedules" && (
            <SchedulesPage
              vehicles={vehicles}
              schedules={scheduleRecords}
              loading={loadingSchedules}
              onRefresh={() => fetchSchedules(user.id)}
              onAddSchedule={async (schedule) => {
                const response = await fetch(
                  "http://localhost/vehicare-api/api.php?action=add_schedule",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...schedule, user_id: user.id }),
                  }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                  throw new Error(data.message || "Could not save schedule.");
                }
                await fetchSchedules(user.id);
              }}
            />
          )}


          {/* NOTIFICATIONS */}

          {page === "notifications" && (
            <NotificationsPage
              vehicles={vehicles}
              notifications={notifications}
              loading={loadingNotifications}
              onRefresh={() => fetchNotifications(user.id)}
              onAddNotification={async (notification) => {
                const response = await fetch(
                  "http://localhost/vehicare-api/api.php?action=add_notification",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...notification, user_id: user.id }),
                  }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                  throw new Error(data.message || "Could not save notification.");
                }
                await fetchNotifications(user.id);
              }}
            />
          )}

          {page === "profile" && (
            <ProfilePage
              user={user}
              onSave={async (profile) => {
                const response = await fetch(
                  "http://localhost/vehicare-api/api.php?action=update_profile",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...profile, user_id: user.id }),
                  }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                  throw new Error(data.message || "Could not update profile.");
                }
                const updatedUser = data.user || { ...user, ...profile };
                localStorage.setItem("vehicareUser", JSON.stringify(updatedUser));
                setUser(updatedUser);
              }}
            />
          )}

        </main>

      </div>

    </div>
  );
}


/* =================================
   LOGIN + REGISTER
================================= */

function Auth({ onLogin }) {

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // =========================
  // LOGIN
  // =========================

  async function handleLoginSubmit(event) {

    event.preventDefault();

    try {

      const response = await fetch(
        "http://localhost/vehicare-api/api.php?action=login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );


      const data = await response.json();


      if (!data.success) {
        alert(data.message);
        return;
      }


      onLogin(data.user);

    } catch (error) {

      console.error(error);

      alert(
        "Cannot connect to the server. Make sure XAMPP Apache and MySQL are running."
      );

    }

  }


  // =========================
  // REGISTER
  // =========================

  async function handleRegisterSubmit(event) {

    event.preventDefault();


    if (password !== confirmPassword) {

      alert("Passwords do not match.");
      return;

    }


    if (password.length < 6) {

      alert("Password must be at least 6 characters.");
      return;

    }


    try {

      const response = await fetch(
        "http://localhost/vehicare-api/api.php?action=register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        }
      );


      const data = await response.json();


      if (!data.success) {

        alert(data.message);
        return;

      }


      alert("Account created successfully!");


      onLogin(data.user);

    } catch (error) {

      console.error(error);

      alert(
        "Cannot connect to the server. Make sure XAMPP Apache and MySQL are running."
      );

    }

  }


  // =========================
  // REGISTER PAGE
  // =========================

  if (mode === "register") {

    return (

      <div className="login-page">

        <div className="login-card">

          <div className="login-logo">
            <i className="bi bi-car-front-fill"></i>
          </div>


          <h1>
            Vehicare
          </h1>


          <p className="login-subtitle">
            Create your Vehicle Owner Account
          </p>


          <form onSubmit={handleRegisterSubmit}>

            {/* NAME */}

            <div className="login-field">

              <label>
                Full Name
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-person"></i>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="login-field">

              <label>
                Email Address
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-envelope"></i>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label>
                Password
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-lock"></i>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="login-field">

              <label>
                Confirm Password
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-lock-fill"></i>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            <button
              type="submit"
              className="login-btn"
            >

              <i className="bi bi-person-plus-fill"></i>

              Create Account

            </button>

          </form>


          <div className="auth-switch">

            Already have an account?

            <button
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>

          </div>


          <div className="login-footer">

            <i className="bi bi-shield-check"></i>

            Secure Vehicle Maintenance Management

          </div>

        </div>

      </div>

    );

  }


  // =========================
  // LOGIN PAGE
  // =========================

  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          <i className="bi bi-car-front-fill"></i>
        </div>


        <h1>
          Vehicare
        </h1>


        <p className="login-subtitle">
          Vehicle Maintenance Management System
        </p>


        <form onSubmit={handleLoginSubmit}>

          {/* EMAIL */}

          <div className="login-field">

            <label>
              Email Address
            </label>

            <div className="login-input-wrapper">

              <i className="bi bi-envelope"></i>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="login-field">

            <label>
              Password
            </label>

            <div className="login-input-wrapper">

              <i className="bi bi-lock"></i>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>

          </div>


          <button
            type="submit"
            className="login-btn"
          >

            <i className="bi bi-box-arrow-in-right"></i>

            Login

          </button>

        </form>


        <div className="auth-switch">

          Don't have an account?

          <button
            type="button"
            onClick={() => setMode("register")}
          >
            Register
          </button>

        </div>


        <div className="login-footer">

          <i className="bi bi-shield-check"></i>

          Secure Vehicle Maintenance Management

        </div>

      </div>

    </div>

  );
}


/* =================================
   DASHBOARD
================================= */

function Dashboard({
  vehicles,
  maintenance,
  schedules,
  expenses,
  setPage,
  loadingVehicles,
}) {

  return (

    <>

      {/* PAGE HEADER */}

      <div className="welcome-section">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Here's an overview of your vehicle maintenance.
          </p>

        </div>


        <div className="dashboard-hero-actions">
          <div className="live-status">
            <i className="bi bi-circle-fill"></i>
            Live Status
          </div>
        </div>

      </div>


      {/* STAT CARDS */}

      <div className="stats-grid">

        {/* VEHICLES */}

        <div className="stat-card blue">

          <div className="stat-label">
            Total Vehicles
          </div>

          <div className="stat-number">

            {loadingVehicles ? "..." : vehicles}

          </div>

          <div className="stat-icon">
            <i className="bi bi-car-front-fill"></i>
          </div>

          <div className="stat-description">
            Registered vehicles
          </div>

        </div>


        {/* MAINTENANCE */}

        <div className="stat-card green">

          <div className="stat-label">
            Maintenance Records
          </div>

          <div className="stat-number">
            {maintenance}
          </div>

          <div className="stat-icon">
            <i className="bi bi-file-earmark-text-fill"></i>
          </div>

          <div className="stat-description">
            Service history
          </div>

        </div>


        {/* SCHEDULES */}

        <div className="stat-card orange">

          <div className="stat-label">
            Schedules
          </div>

          <div className="stat-number">
            {schedules}
          </div>

          <div className="stat-icon">
            <i className="bi bi-calendar-check-fill"></i>
          </div>

          <div className="stat-description">
            Upcoming services
          </div>

        </div>


        {/* EXPENSES */}

        <div className="stat-card purple">

          <div className="stat-label">
            Total Expenses
          </div>

          <div className="stat-number">
            ₱{expenses.toFixed(2)}
          </div>

          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>

          <div className="stat-description">
            Maintenance spending
          </div>

        </div>

      </div>


      {/* DASHBOARD LOWER CARDS */}

      <div className="dashboard-grid">

        {/* RECENT MAINTENANCE */}

        <div className="custom-card">

          <div className="card-header">

            <div>

              <h2>
                Recent Maintenance
              </h2>

              <p>
                Your latest vehicle service records
              </p>

            </div>


            <button
              type="button"
              className="text-btn"
              onClick={() => setPage("maintenance")}
            >

              View All

              <i className="bi bi-arrow-right"></i>

            </button>

          </div>


          <div className="empty-state">

            <div className="empty-icon">
              <i className="bi bi-tools"></i>
            </div>

            <h3>
              No maintenance records yet
            </h3>

            <p>
              Add your first maintenance record
              to start tracking your vehicle.
            </p>

          </div>

        </div>


        {/* FORECAST */}

        <div className="custom-card forecast-card">

          <div className="forecast-icon">
            <i className="bi bi-stars"></i>
          </div>


          <div className="card-header">

            <div>

              <h2>
                Maintenance Cost Forecast
              </h2>

              <p>
                Based on your previous maintenance records.
              </p>

            </div>

          </div>


          <div className="stat-label">
            ESTIMATED NEXT COST
          </div>


          <div className="forecast-value">
            ₱0.00
          </div>


          <p className="forecast-text">
            Add more maintenance records to generate
            a more useful cost forecast.
          </p>


          <div className="forecast-bar">

            <div style={{ width: "15%" }}></div>

          </div>

        </div>

      </div>


      {/* READY CARD */}

      <div className="custom-card ready-card">

        <div className="empty-icon">
          <i className="bi bi-car-front-fill"></i>
        </div>


        <h2>
          Your Vehicare System is Ready
        </h2>


        <p>
          Select any menu item on the sidebar to manage
          your registered vehicles and maintenance records.
        </p>


        <button
          type="button"
          className="primary-btn"
          onClick={() => setPage("vehicles")}
        >

          <i className="bi bi-plus-lg"></i>

          Add Your First Vehicle

        </button>

      </div>

    </>

  );
}


/* =================================
   VEHICLES PAGE
================================= */

function VehiclesPage({
  vehicles,
  loadingVehicles,
  onRefresh,
  onAddVehicle,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAddVehicle(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const vehicle = Object.fromEntries(formData.entries());
    vehicle.year = Number(vehicle.year);
    vehicle.current_mileage = Number(vehicle.current_mileage);
    try {
      await onAddVehicle(vehicle);
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || "Could not add vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (

    <>

      <div className="page-heading">

        <div>

          <h1>
            Vehicles
          </h1>

          <p>
            Manage your registered vehicles.
          </p>

        </div>


        <button
          type="button"
          className="primary-btn"
          onClick={() => { setError(""); setShowAddForm(true); }}
        >

          <i className="bi bi-plus-lg"></i>

          Add Vehicle

        </button>

      </div>

      {showAddForm && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setShowAddForm(false);
        }}>
          <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title">
            <div className="modal-heading">
              <div>
                <h2 id="add-vehicle-title">Add a vehicle</h2>
                <p>Enter your vehicle details to start tracking it.</p>
              </div>
              <button type="button" className="modal-close" aria-label="Close" disabled={saving} onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddVehicle}>
              <label>Vehicle name<input name="vehicle_name" placeholder="e.g. Family car" required /></label>
              <div className="vehicle-form-grid">
                <label>Brand<input name="brand" placeholder="e.g. Toyota" required /></label>
                <label>Model<input name="model" placeholder="e.g. Vios" required /></label>
                <label>Year<input name="year" type="number" min="1900" max={new Date().getFullYear() + 1} required /></label>
                <label>Plate number<input name="plate_number" placeholder="e.g. ABC 1234" required /></label>
                <label className="mileage-field">Current mileage (km)<input name="current_mileage" type="number" min="0" defaultValue="0" required /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="logout-btn" disabled={saving} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Vehicle"}</button>
              </div>
            </form>
          </section>
        </div>
      )}


      <div className="custom-card">

        {loadingVehicles ? (

          <div className="empty-state">

            <div className="empty-icon">
              <i className="bi bi-arrow-repeat"></i>
            </div>

            <h3>
              Loading vehicles...
            </h3>

            <p>
              Please wait while we load your vehicles.
            </p>

          </div>

        ) : vehicles.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              <i className="bi bi-car-front-fill"></i>
            </div>

            <h3>
              No vehicles yet
            </h3>

            <p>
              You don't have any registered vehicles.
            </p>

            <button
              type="button"
              className="primary-btn"
              onClick={() => { setError(""); setShowAddForm(true); }}
            >

              <i className="bi bi-plus-lg"></i>

              Add Your First Vehicle

            </button>

          </div>

        ) : (

          <div className="vehicle-list">

            {vehicles.map((vehicle) => (

              <div
                className="vehicle-item"
                key={vehicle.id}
              >

                <div className="vehicle-item-icon">

                  <i className="bi bi-car-front-fill"></i>

                </div>


                <div className="vehicle-item-info">

                  <h3>
                    {vehicle.vehicle_name}
                  </h3>

                  <p>
                    {vehicle.brand} {vehicle.model}
                  </p>

                  <span>
                    Plate Number: {vehicle.plate_number}
                  </span>

                </div>


                <div className="vehicle-item-details">

                  <strong>
                    {vehicle.year}
                  </strong>

                  <small>
                    {vehicle.current_mileage} km
                  </small>

                </div>

              </div>

            ))}


            <button
              type="button"
              className="text-btn"
              onClick={onRefresh}
            >

              <i className="bi bi-arrow-clockwise"></i>

              Refresh Vehicles

            </button>

          </div>

        )}

      </div>

    </>

  );
}


/* =================================
   PLACEHOLDER PAGES
================================= */

function MaintenancePage({ vehicles, records, loading, onRefresh, onAddMaintenance }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const record = Object.fromEntries(form.entries());
    record.vehicle_id = Number(record.vehicle_id);
    record.cost = Number(record.cost);
    record.mileage = Number(record.mileage);
    try {
      await onAddMaintenance(record);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Could not save maintenance record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>Maintenance</h1><p>View and manage your vehicle service records.</p></div>
        <button type="button" className="primary-btn" disabled={!vehicles.length} onClick={() => { setError(""); setShowForm(true); }}><i className="bi bi-plus-lg"></i> Add Maintenance</button>
      </div>
      <div className="custom-card">
        {loading ? <div className="empty-state"><h3>Loading maintenance...</h3></div> : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-tools"></i></div>
            <h3>{vehicles.length ? "No maintenance records yet" : "Add a vehicle first"}</h3>
            <p>{vehicles.length ? "Keep track of the services and repairs performed on your vehicles." : "You need a registered vehicle before you can add a maintenance record."}</p>
            {vehicles.length > 0 && <button type="button" className="primary-btn" onClick={() => setShowForm(true)}><i className="bi bi-plus-lg"></i> Add Your First Record</button>}
          </div>
        ) : (
          <div className="vehicle-list">
            {records.map((record) => (
              <div className="vehicle-item" key={record.id}>
                <div className="vehicle-item-icon"><i className="bi bi-tools"></i></div>
                <div className="vehicle-item-info">
                  <h3>{record.service_type}</h3>
                  <p>{record.vehicle_name || `${record.brand || ""} ${record.model || ""}`}</p>
                  <span>{record.service_date} · {Number(record.mileage || 0).toLocaleString()} km</span>
                  {record.notes && <span>{record.notes}</span>}
                </div>
                <div className="vehicle-item-details"><strong>₱{Number(record.cost || 0).toFixed(2)}</strong></div>
              </div>
            ))}
            <button type="button" className="text-btn" onClick={onRefresh}><i className="bi bi-arrow-clockwise"></i> Refresh Records</button>
          </div>
        )}
      </div>
      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setShowForm(false); }}>
          <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-maintenance-title">
            <div className="modal-heading"><div><h2 id="add-maintenance-title">Add maintenance</h2><p>Record a service or repair for your vehicle.</p></div><button type="button" className="modal-close" aria-label="Close" disabled={saving} onClick={() => setShowForm(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="vehicle-form-grid maintenance-form-grid">
                <label className="mileage-field">Vehicle<select name="vehicle_id" required defaultValue=""><option value="" disabled>Select a vehicle</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_name} — {vehicle.brand} {vehicle.model}</option>)}</select></label>
                <label>Service type<input name="service_type" placeholder="e.g. Oil change" required /></label>
                <label>Service date<input name="service_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
                <label>Mileage (km)<input name="mileage" type="number" min="0" required /></label>
                <label>Cost (₱)<input name="cost" type="number" min="0" step="0.01" required /></label>
                <label className="mileage-field">Notes (optional)<textarea name="notes" rows="3" placeholder="Parts replaced, work completed, etc." /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="logout-btn" disabled={saving} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Record"}</button></div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function SchedulesPage({ vehicles, schedules, loading, onRefresh, onAddSchedule }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const schedule = Object.fromEntries(form.entries());
    schedule.vehicle_id = Number(schedule.vehicle_id);
    schedule.due_mileage = schedule.due_mileage ? Number(schedule.due_mileage) : null;
    try {
      await onAddSchedule(schedule);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Could not save schedule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>Schedules</h1><p>Plan upcoming services and maintenance.</p></div>
        <button type="button" className="primary-btn" disabled={!vehicles.length} onClick={() => { setError(""); setShowForm(true); }}><i className="bi bi-plus-lg"></i> Add Schedule</button>
      </div>
      <div className="custom-card">
        {loading ? <div className="empty-state"><h3>Loading schedules...</h3></div> : schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-calendar-check-fill"></i></div>
            <h3>{vehicles.length ? "No schedules yet" : "Add a vehicle first"}</h3>
            <p>{vehicles.length ? "Create a schedule to keep your next service on track." : "You need a registered vehicle before scheduling maintenance."}</p>
            {vehicles.length > 0 && <button type="button" className="primary-btn" onClick={() => setShowForm(true)}><i className="bi bi-plus-lg"></i> Add Your First Schedule</button>}
          </div>
        ) : (
          <div className="vehicle-list">
            {schedules.map((schedule) => (
              <div className="vehicle-item" key={schedule.id}>
                <div className="vehicle-item-icon"><i className="bi bi-calendar-check-fill"></i></div>
                <div className="vehicle-item-info">
                  <h3>{schedule.service_type}</h3>
                  <p>{schedule.vehicle_name || `${schedule.brand || ""} ${schedule.model || ""}`}</p>
                  <span>Due {schedule.due_date}{schedule.due_mileage ? ` · ${Number(schedule.due_mileage).toLocaleString()} km` : ""}</span>
                  {schedule.notes && <span>{schedule.notes}</span>}
                </div>
                <div className="vehicle-item-details"><strong>{schedule.status || "Scheduled"}</strong></div>
              </div>
            ))}
            <button type="button" className="text-btn" onClick={onRefresh}><i className="bi bi-arrow-clockwise"></i> Refresh Schedules</button>
          </div>
        )}
      </div>
      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setShowForm(false); }}>
          <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-schedule-title">
            <div className="modal-heading"><div><h2 id="add-schedule-title">Add a schedule</h2><p>Set a reminder for an upcoming service.</p></div><button type="button" className="modal-close" aria-label="Close" disabled={saving} onClick={() => setShowForm(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="vehicle-form-grid maintenance-form-grid">
                <label className="mileage-field">Vehicle<select name="vehicle_id" required defaultValue=""><option value="" disabled>Select a vehicle</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_name} — {vehicle.brand} {vehicle.model}</option>)}</select></label>
                <label>Service type<input name="service_type" placeholder="e.g. Tire rotation" required /></label>
                <label>Due date<input name="due_date" type="date" required /></label>
                <label>Due mileage (km, optional)<input name="due_mileage" type="number" min="0" /></label>
                <label className="mileage-field">Notes (optional)<textarea name="notes" rows="3" placeholder="Anything to remember about this service" /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="logout-btn" disabled={saving} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Schedule"}</button></div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function ProfilePage({ user, onSave }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const profile = Object.fromEntries(form.entries());
    try {
      await onSave(profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading"><div><h1>Profile</h1><p>Manage your account details.</p></div></div>
      <div className="custom-card profile-card">
        <div className="profile-summary">
          <div className="profile-avatar">{getInitials(user.name)}</div>
          <div><h2>{user.name}</h2><p>Vehicle Owner</p></div>
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>Full name<input name="name" type="text" defaultValue={user.name || ""} required /></label>
          <label>Email address<input name="email" type="email" defaultValue={user.email || ""} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}
          <div className="modal-actions"><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button></div>
        </form>
      </div>
    </>
  );
}

function NotificationsPage({ vehicles, notifications, loading, onRefresh, onAddNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const notification = Object.fromEntries(form.entries());
    notification.vehicle_id = Number(notification.vehicle_id);
    try {
      await onAddNotification(notification);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Could not save notification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>Notifications</h1><p>Create and manage reminders for your vehicles.</p></div>
        <button type="button" className="primary-btn" disabled={!vehicles.length} onClick={() => { setError(""); setShowForm(true); }}><i className="bi bi-plus-lg"></i> Add Notification</button>
      </div>
      <div className="custom-card">
        {loading ? <div className="empty-state"><h3>Loading notifications...</h3></div> : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="bi bi-bell-fill"></i></div>
            <h3>{vehicles.length ? "No notifications yet" : "Add a vehicle first"}</h3>
            <p>{vehicles.length ? "Set a reminder so you do not miss an upcoming service." : "You need a registered vehicle before creating a reminder."}</p>
            {vehicles.length > 0 && <button type="button" className="primary-btn" onClick={() => setShowForm(true)}><i className="bi bi-plus-lg"></i> Add Your First Notification</button>}
          </div>
        ) : (
          <div className="vehicle-list">
            {notifications.map((notification) => (
              <div className="vehicle-item" key={notification.id}>
                <div className="vehicle-item-icon"><i className="bi bi-bell-fill"></i></div>
                <div className="vehicle-item-info">
                  <h3>{notification.title}</h3>
                  <p>{notification.vehicle_name || `${notification.brand || ""} ${notification.model || ""}`}</p>
                  {notification.message && <span>{notification.message}</span>}
                </div>
                <div className="vehicle-item-details"><strong>{notification.remind_at ? new Date(notification.remind_at).toLocaleString() : "Reminder"}</strong></div>
              </div>
            ))}
            <button type="button" className="text-btn" onClick={onRefresh}><i className="bi bi-arrow-clockwise"></i> Refresh Notifications</button>
          </div>
        )}
      </div>
      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setShowForm(false); }}>
          <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-notification-title">
            <div className="modal-heading"><div><h2 id="add-notification-title">Add a notification</h2><p>Choose what to be reminded about and when.</p></div><button type="button" className="modal-close" aria-label="Close" disabled={saving} onClick={() => setShowForm(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="vehicle-form-grid maintenance-form-grid">
                <label className="mileage-field">Vehicle<select name="vehicle_id" required defaultValue=""><option value="" disabled>Select a vehicle</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_name} — {vehicle.brand} {vehicle.model}</option>)}</select></label>
                <label className="mileage-field">Title<input name="title" placeholder="e.g. Oil change reminder" required /></label>
                <label>Reminder date and time<input name="remind_at" type="datetime-local" required /></label>
                <label className="mileage-field">Message (optional)<textarea name="message" rows="3" placeholder="Add details for this reminder" /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="logout-btn" disabled={saving} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Notification"}</button></div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function PagePlaceholder({
  title,
  description,
  icon,
}) {

  return (

    <>

      <div className="page-heading">

        <div>

          <h1>
            {title}
          </h1>

          <p>
            {description}
          </p>

        </div>


        <button
          type="button"
          className="primary-btn"
        >

          <i className="bi bi-plus-lg"></i>

          Add {title}

        </button>

      </div>


      <div className="custom-card">

        <div className="empty-state">

          <div className="empty-icon">

            <i className={icon}></i>

          </div>


          <h3>
            No {title.toLowerCase()} yet
          </h3>


          <p>
            Your {title.toLowerCase()} will appear here.
          </p>

        </div>

      </div>

    </>

  );
}


/* =================================
   GET INITIALS
================================= */

function getInitials(name) {

  if (!name) {
    return "VO";
  }


  const words = name.trim().split(" ");


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();

}


export default App;
