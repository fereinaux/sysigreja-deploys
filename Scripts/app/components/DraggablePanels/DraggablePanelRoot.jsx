export function DraggablePanelRoot({ panel, children }) {
  return (
      <div
        key={`${panel.Id}`}
        data-id={panel.Id}
        style={{
          marginBottom: "25px",
          backgroundColor: panel.Cor,
          backgroundClip: "content-box",
          borderRadius: "28px",
        }}
        className="p-xs col-xs-12 col-lg-4 pg text-center text-white"
      >
        {children}
      </div>
  );
}
