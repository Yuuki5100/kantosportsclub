import React from "react";
import CurrentNoticeList from "@/components/functional/CurrentNoticeList";
import TopPageActionSections from "@/components/functional/TopPageActionSections";

const TopPage: React.FC = () => (
  <>
    <CurrentNoticeList />
    <TopPageActionSections />
  </>
);

export default TopPage;
