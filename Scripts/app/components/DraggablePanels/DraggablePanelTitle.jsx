export function DraggablePanelTitle({ title, children }) {
  return (
    <>
      <h4 style={{ paddingTop: "5px" }}>{title}</h4>
      {children}
    </>
  );
}
