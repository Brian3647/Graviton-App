import { useState } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { Tab } from "../../modules/tab";
import { focusedTab } from "../../utils/atoms";
import TabContainer from "./TabContainer";
import TabButton from "./TabButton";

const TabsPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  & .tabsList {
    display: flex;
    min-height: 40px;
    overflow-x: auto;
    background: ${({ theme }) => theme.elements.tab.list.background};
    &:empty {
      background: transparent;
    }
    &::-webkit-scrollbar {
      height: 6px !important;
    }
  }
  & .tabsContainer {
    display: flex;
    height: calc(100% - 45px);
    & > div {
      width: 100%;
    }
    & .cm-editor {
      height: 100%;
    }
  }
`;

interface TabPanelOptions {
  tabs: Tab[];
  col: number;
  row: number;
  close: (i: number) => void;
}

export default function TabsPanel({ tabs, col, row, close }: TabPanelOptions) {
  const [selectedTabID, setSelectedTabID] = useState<string | null>(null);
  const setFocusedTab = useSetRecoilState(focusedTab);

  // If there isn't any tab opened then set the selected tab to null
  if (tabs.length === 0 && selectedTabID != null) {
    setSelectedTabID(null);
  }

  // If there is not selected tab but there exists one, select it
  if (selectedTabID == null && tabs.length > 0) {
    setSelectedTabID(tabs[0].id);
  }

  function selectTab(id: string) {
    // Update the panel state
    setSelectedTabID(id);

    // Focus the tab
    setFocusedTab({
      col,
      row,
      id,
    });
  }

  function removeTab(index: number) {
    setSelectedTabID(null);
    close(index);
  }

  return (
    <TabsPanelContainer>
      <div className="tabsList">
        {tabs.map((tab, i) => {
          const isSelected = tab.id == selectedTabID;
          return (
            <TabButton
              key={tab.id}
              title={tab.title}
              isSelected={isSelected}
              select={() => selectTab(tab.id)}
              close={() => removeTab(i)}
            />
          );
        })}
      </div>
      <div className="tabsContainer">
        {tabs.map((tab) => {
          const isSelected = tab.id == selectedTabID;
          const Container = tab.container;
          return (
            isSelected && (
              <TabContainer key={tab.id}>
                <Container />
              </TabContainer>
            )
          );
        })}
      </div>
    </TabsPanelContainer>
  );
}
