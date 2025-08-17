import "./AuthLayout.css";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <div className="logo">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
