const fs = require("fs");
const path = require("path");

// New CSS template variables (shared across all pages)
const cssTemplate = {
  signup: `/* Signup Page - Distinctive Monoton Design */
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

.signup-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0e27 0%, #1a0f2e 50%, #2a0a3a 100%);
  z-index: -2;
}

.background-glow-signup {
  position: absolute;
  bottom: -40%;
  left: -5%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  z-index: -1;
}

.signup-content {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.signup-card {
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(26, 15, 46, 0.95) 100%);
  border: 2px solid var(--secondary-color);
  border-radius: 0;
  padding: 3.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 30px 80px rgba(0, 245, 255, 0.2), inset 0 0 50px rgba(255, 0, 110, 0.05);
  position: relative;
  overflow: hidden;
}

.signup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
}

.signup-header {
  text-align: center;
  margin-bottom: 3rem;
}

.signup-header h1 {
  font-family: 'Monoton', cursive;
  font-size: 4rem;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
  text-shadow: 0 0 30px rgba(0, 245, 255, 0.4);
}

.signup-form {
  margin-bottom: 2.5rem;
}

.signup-form .form-group {
  margin-bottom: 1.8rem;
}

.signup-form .btn-primary {
  width: 100%;
  padding: 1.1rem;
  background: linear-gradient(135deg, var(--secondary-color) 0%, #00d9ff 100%);
  color: var(--neutral-dark);
  border-color: var(--secondary-color);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}

.signup-form .btn-primary:hover:not(:disabled) {
  box-shadow: 0 15px 40px rgba(0, 245, 255, 0.6);
}

.benefits-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.benefit-card {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.08) 0%, rgba(6, 255, 165, 0.08) 100%);
  border: 2px solid var(--success-color);
  border-left: 4px solid var(--secondary-color);
  padding: 1.8rem;
  border-radius: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.benefit-card:hover {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.12) 0%, rgba(6, 255, 165, 0.12) 100%);
  transform: translateX(15px);
  border-color: var(--secondary-color);
}

.benefit-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: inline-block;
}

.benefit-card h4 {
  color: var(--text-primary);
  margin-bottom: 0.6rem;
  font-weight: 700;
  font-family: 'Lexend Deca', sans-serif;
}

.benefit-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .signup-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .signup-card {
    padding: 2.5rem;
  }

  .signup-header h1 {
    font-size: 2.5rem;
  }

  .benefits-cards {
    display: none;
  }
}`,

  worker: `/* Worker Dashboard - Monoton Design */
.worker-dashboard {
  min-height: calc(100vh - 60px);
  padding: 2.5rem 0;
  background: linear-gradient(135deg, var(--neutral-dark) 0%, #0f1535 50%, #1a0f2e 100%);
}

.dashboard-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(26, 15, 46, 0.9) 100%);
  padding: 2.5rem;
  border-radius: 0;
  border: 2px solid var(--primary-color);
}

.dashboard-header h1 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 0, 110, 0.1);
  padding: 1.5rem;
  border-radius: 0;
  text-align: center;
  border: 2px solid var(--primary-color);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.raise-ticket-section,
.view-tickets-section {
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(26, 15, 46, 0.9) 100%);
  border: 2px solid var(--primary-color);
  padding: 2.5rem;
  border-radius: 0;
  margin-bottom: 2.5rem;
}

.raise-ticket-section:hover,
.view-tickets-section:hover {
  border-color: var(--secondary-color);
  box-shadow: 0 20px 60px rgba(0, 245, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--secondary-color) 0%, #00d9ff 100%);
  color: var(--neutral-dark);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 0;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.5);
}

.ticket-form {
  background: rgba(255, 0, 110, 0.05);
  padding: 2rem;
  border-radius: 0;
  border: 2px solid var(--primary-color);
  margin-bottom: 1.5rem;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ticket-card {
  background: rgba(255, 0, 110, 0.05);
  border: 2px solid var(--primary-color);
  padding: 1.8rem;
  border-radius: 0;
  transition: all 0.3s ease;
}

.ticket-card:hover {
  border-color: var(--secondary-color);
  box-shadow: 0 12px 30px rgba(0, 245, 255, 0.15);
  transform: translateY(-4px);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.ticket-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.ticket-id {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  font-weight: 700;
  text-transform: uppercase;
}

.ticket-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.ticket-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.meta-item {
  color: var(--text-secondary);
}

.meta-item strong {
  color: var(--text-primary);
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 0, 110, 0.05);
  border-radius: 0;
  border: 2px dashed var(--primary-color);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }

  .header-stats {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-secondary {
    width: 100%;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
  }
}`,

  provider: `/* Provider Dashboard - Monoton Design */
.provider-dashboard {
  min-height: calc(100vh - 60px);
  padding: 2.5rem 0;
  background: linear-gradient(135deg, var(--neutral-dark) 0%, #0f1535 50%, #1a0f2e 100%);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(26, 15, 46, 0.9) 100%);
  padding: 2.5rem;
  border-radius: 0;
  border: 2px solid var(--secondary-color);
}

.dashboard-header h1 {
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
}

.header-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(0, 245, 255, 0.1);
  padding: 1.25rem;
  border-radius: 0;
  text-align: center;
  border: 2px solid var(--secondary-color);
  min-width: 110px;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.tickets-section {
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(26, 15, 46, 0.9) 100%);
  border: 2px solid var(--secondary-color);
  padding: 2.5rem;
  border-radius: 0;
  margin-bottom: 2.5rem;
}

.tickets-section:hover {
  border-color: var(--info-color);
}

.tickets-section h3 {
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.tickets-table-wrapper {
  overflow-x: auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
}

.tickets-table thead {
  background: rgba(0, 245, 255, 0.1);
  border: 2px solid var(--secondary-color);
}

.tickets-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tickets-table tbody tr {
  border-bottom: 2px solid var(--primary-color);
  transition: all 0.3s ease;
}

.tickets-table tbody tr:hover {
  background: rgba(255, 0, 110, 0.05);
}

.tickets-table td {
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.id-badge {
  background: rgba(0, 245, 255, 0.2);
  color: var(--secondary-color);
  padding: 0.35rem 0.75rem;
  border-radius: 0;
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid var(--secondary-color);
}

.title-col {
  color: var(--text-primary);
  font-weight: 500;
}

.action-col {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  border-radius: 0;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-update {
  background: rgba(0, 245, 255, 0.2);
  color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.btn-update:hover {
  background: var(--secondary-color);
  color: var(--neutral-dark);
  transform: translateY(-2px);
}

.btn-view {
  background: rgba(255, 0, 110, 0.2);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-view:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.quick-stat-card {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(255, 0, 110, 0.1) 100%);
  border: 2px solid var(--secondary-color);
  padding: 2rem;
  border-radius: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.quick-stat-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 12px 30px rgba(0, 245, 255, 0.1);
  transform: translateY(-4px);
}

.stat-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.stat-value {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--secondary-color);
}

.stat-icon {
  font-size: 2.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(0, 245, 255, 0.05);
  border-radius: 0;
  border: 2px dashed var(--secondary-color);
}

@media (max-width: 1024px) {
  .header-stats {
    gap: 0.75rem;
  }

  .stat-card {
    min-width: 90px;
    padding: 1rem;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }

  .header-stats {
    width: 100%;
    gap: 0.75rem;
  }

  .tickets-table {
    font-size: 0.85rem;
  }

  .tickets-table th,
  .tickets-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}`,

  manager: `/* Manager Dashboard - Monoton Design */
.manager-dashboard {
  min-height: calc(100vh - 60px);
  padding: 2.5rem 0;
  background: linear-gradient(135deg, var(--neutral-dark) 0%, #0f1535 50%, #1a0f2e 100%);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(26, 15, 46, 0.9) 100%);
  padding: 2.5rem;
  border-radius: 0;
  border: 2px solid var(--danger-color);
}

.dashboard-header h1 {
  margin-bottom: 0.5rem;
  color: var(--danger-color);
}

.header-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 0, 110, 0.1);
  padding: 1.25rem;
  border-radius: 0;
  text-align: center;
  border: 2px solid var(--danger-color);
  min-width: 100px;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--danger-color);
  margin-bottom: 0.5rem;
}

.all-tickets-section,
.performance-metrics {
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(26, 15, 46, 0.9) 100%);
  border: 2px solid var(--danger-color);
  padding: 2.5rem;
  border-radius: 0;
  margin-bottom: 2.5rem;
}

.all-tickets-section:hover,
.performance-metrics:hover {
  border-color: var(--secondary-color);
}

.all-tickets-section h3,
.performance-metrics h3 {
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.tickets-table-wrapper {
  overflow-x: auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
}

.tickets-table thead {
  background: rgba(255, 0, 110, 0.1);
  border: 2px solid var(--danger-color);
}

.tickets-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tickets-table tbody tr {
  border-bottom: 2px solid var(--primary-color);
  transition: all 0.3s ease;
}

.tickets-table tbody tr:hover {
  background: rgba(255, 0, 110, 0.05);
}

.tickets-table td {
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.id-badge {
  background: rgba(0, 245, 255, 0.2);
  color: var(--secondary-color);
  padding: 0.35rem 0.75rem;
  border-radius: 0;
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid var(--secondary-color);
}

.title-col {
  color: var(--text-primary);
  font-weight: 500;
}

.provider-unassigned {
  color: var(--warning-color);
  font-weight: 700;
  text-transform: uppercase;
}

.provider-assigned {
  color: var(--success-color);
  font-weight: 700;
}

.action-col {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  border-radius: 0;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
}

.btn-assign {
  background: rgba(6, 255, 165, 0.2);
  color: var(--success-color);
  border-color: var(--success-color);
}

.btn-assign:hover {
  background: var(--success-color);
  color: var(--neutral-dark);
  transform: translateY(-2px);
}

.btn-view {
  background: rgba(255, 0, 110, 0.2);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-view:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.05) 0%, rgba(255, 0, 110, 0.05) 100%);
  border: 2px solid var(--primary-color);
  padding: 1.5rem;
  border-radius: 0;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: var(--secondary-color);
  box-shadow: 0 12px 30px rgba(0, 245, 255, 0.1);
  transform: translateY(-4px);
}

.metric-label {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.metric-trend {
  color: var(--success-color);
  font-size: 0.85rem;
  font-weight: 700;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.assign-modal,
.detail-modal {
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 0;
  max-width: 450px;
  width: 100%;
  animation: slideInUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.modal-header h5 {
  margin: 0;
  color: var(--text-primary);
  font-family: 'Monoton', cursive;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: var(--danger-color);
}

.modal-body {
  padding: 1.5rem;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.provider-option {
  background: rgba(255, 0, 110, 0.1);
  border: 2px solid var(--primary-color);
  color: var(--text-primary);
  padding: 1rem;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.provider-option:hover {
  background: rgba(255, 0, 110, 0.2);
  border-color: var(--secondary-color);
  transform: translateX(5px);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--primary-color);
  gap: 1rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  color: var(--text-primary);
  min-width: 120px;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 0, 110, 0.05);
  border-radius: 0;
  border: 2px dashed var(--primary-color);
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }

  .header-stats {
    width: 100%;
    gap: 0.75rem;
  }

  .tickets-table {
    font-size: 0.85rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}`,
};

// Write all CSS files
const pagesDir = path.join(__dirname, "src", "pages");

Object.entries(cssTemplate).forEach(([page, css]) => {
  let fileName;
  switch (page) {
    case "signup":
      fileName = "SignupPage.css";
      break;
    case "worker":
      fileName = "WorkerDashboard.css";
      break;
    case "provider":
      fileName = "ProviderDashboard.css";
      break;
    case "manager":
      fileName = "ManagerDashboard.css";
      break;
  }

  fs.writeFileSync(path.join(pagesDir, fileName), css);
  console.log(`✓ Updated ${fileName}`);
});

console.log("\n✨ All CSS files rebuilt with distinctive Monoton design!");
