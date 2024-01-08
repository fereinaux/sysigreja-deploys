export function DraggablePanelPrintButton({ panel, handleClick }) {
  return (
    <button
      type="button"
      className="btn btn-rounded btn-default print-button"
      onClick={() => handleClick(panel)}
    >
      <i className="fa fa-2x fa-print"></i>
    </button>
  );
}
