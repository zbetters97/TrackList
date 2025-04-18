export default function Tabs(props) {
  const { tabs, activeTab, setActiveTab, setResults } = props;

  function handleClick(tab) {
    setResults && setResults(null);
    setActiveTab(tab.id);
  }

  return (
    <div className="flex justify-center gap-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`border-b-2 px-4 pb-2 text-2xl font-semibold ${
            activeTab === tab.id
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-300 hover:text-green-700"
          }`}
          onClick={() => handleClick(tab)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
