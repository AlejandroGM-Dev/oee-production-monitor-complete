export const StatusMessage = ({ title, message, action }) => (
  <div className="status-message">
    <h2>{title}</h2>
    {message ? <p>{message}</p> : null}
    {action}
  </div>
);