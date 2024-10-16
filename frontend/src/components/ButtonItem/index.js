import "./index.css";

const ButtonItem = (props) => {
  const { item, clickSidebar, selected } = props;
  const { image, buttonName } = item;

  return (
    <li
      onClick={() => clickSidebar(buttonName)}
      className={
        selected === buttonName ? "selected-sidebar" : "button-list-item"
      }
    >
      {image}
      <p>{buttonName}</p>
    </li>
  );
};

export default ButtonItem;
