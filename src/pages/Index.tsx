import { useState } from "react";
import { Home } from "./Home";
import { MatchScreen } from "./MatchScreen";
import { Settings } from "./Settings";

type Page = "home" | "match" | "settings";

const Index = () => {
  const [page, setPage] = useState<Page>("home");

  switch (page) {
    case "match":
      return <MatchScreen onNavigate={setPage} />;
    case "settings":
      return <Settings onNavigate={setPage} />;
    default:
      return <Home onNavigate={setPage} />;
  }
};

export default Index;
