const { useEffect, useState } = React;

function loadList(rootElement, list, title, placeholder) {
  rootElement.render(
    <FilterableList list={list} title={title} placeholder={placeholder} />
  );
}

function FilterableList({ list, title, placeholder }) {
  useEffect(() => {
    DragDropg();
  });

  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <h4 className="p-h-xs">{title}</h4>
      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                className="form-control"
                id="input-search"
                name="input-search"
                placeholder={placeholder}
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
            </th>
          </tr>
        </thead>
        <tbody id="table-list">
          {list &&
            list
              .filter((filter) =>
                filter.Value.toLowerCase().includes(
                  inputValue.toLocaleLowerCase()
                )
              )
              .map((item) => (
                <tr key={item.Id}>
                  <td className="draggable" data-id={item.Id}>{item.Value}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </>
  );
}
