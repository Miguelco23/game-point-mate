import { useState } from "react";
import { Home } from "./Home";
import { MatchScreen } from "./MatchScreen";
import { SavedMatches } from "./SavedMatches";
import { Settings } from "./Settings";

type Page = "home" | "match" | "settings" | "saved-matches";

const Index = () => {
  const [page, setPage] = useState<Page>("home");

  switch (page) {
    case "match":
      return <MatchScreen onNavigate={setPage} />;
    case "settings":
      return <Settings onNavigate={setPage} />;
    case "saved-matches":
      return <SavedMatches onNavigate={setPage} />;
    default:
      return <Home onNavigate={setPage} />;
  }
};

export default Index;
