import { PropsWithChildren, useEffect } from "react";
import { createClient } from "../utils/client";
import {
  openedTabsState,
  clientState,
  prompts,
  panels,
  showedWindows,
} from "../utils/atoms";
import {
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import RecoilExternalState from "./ExternalState";
import { Tab, TabData } from "../modules/tab";
import Panels from "./PanelsView";
import Tabs from "./TabsView";
import Theme from "../utils/theme_provider";
import View from "./RootView";
import { SplitPane } from "react-multi-split-pane";
import { useHotkeys } from "react-hotkeys-hook";
import { isTauri } from "../utils/commands";
import ExplorerPanel from "../panels/explorer";
import { Popup } from "../modules/popup";
import { ShowPopup, StateUpdated } from "../types/messages";

/*
 * Retrieve the authentication token
 */
async function getToken() {
  if (isTauri) {
    return "graviton_token";
  } else {
    // Or query the URL to get the token
    return new URL(location.toString()).searchParams.get("token");
  }
}

/**
 * Handles the state Connection
 */
function StateRoot() {
  const setClient = useSetRecoilState(clientState);
  const setPanels = useSetRecoilState(panels);

  useEffect(() => {
    // Retrieve the token and then create a new client
    getToken().then((token) => {
      if (token !== null) {
        const client = createClient(token);
        // Wait until it's connected
        client.on("connected", () => {
          client.listenToState();
          setClient(client);
          setPanels([
            {
              panel: new ExplorerPanel(),
            },
          ]);
        });
      }
    });
  }, []);

  return null;
}

/**
 * Handles the root view
 */
function ClientRoot({ children }: PropsWithChildren<any>) {
  const client = useRecoilValue(clientState);
  const usePrompts = useRecoilValue(prompts);
  const [useShowedWindows, setShowedWindows] = useRecoilState(showedWindows);
  const setTabs = useSetRecoilState(openedTabsState);

  /**
   *  Register all prompts's shortcuts
   */
  usePrompts.forEach((PromptClass) => {
    const prompt = new PromptClass();
    if (prompt.shortcut) {
      useHotkeys(prompt.shortcut, () => {
        setShowedWindows((val) => [...val, prompt]);
      });
    }
  });

  useEffect(() => {

    if (client != null) {
      /**
       * Update the App state if a new state is received
       */
      client.on("StateUpdated", ({ state }: StateUpdated) => {
        // Convert all tab datas into Tab instances
        const openedTabs = state.opened_tabs.map((tabData: TabData) =>
          Tab.fromJson(tabData)
        );
        // Open the tabs
        if (openedTabs.length > 0) {
          setTabs([[openedTabs]]);
        }
      });

      /**
       * Display Popups
       */
      client.on("ShowPopup", (e: ShowPopup) => {
        setShowedWindows((val) => [...val, new Popup(e.title, e.content)]);
      });
    }
  }, [client])

  /**
   * Close all the last opened window when ESC is pressed
   */
  useHotkeys("esc", () => {
    setShowedWindows((val) => {
      const newValue = [...val];
      newValue.pop();
      return newValue;
    });
  });

  function WindowsView() {
    if (useShowedWindows.length > 0) {
      const Container = useShowedWindows[useShowedWindows.length - 1].container;
      return <Container />;
    } else {
      return null;
    }
  }

  return (
    <View>
      {client && children}
      <WindowsView />
    </View>
  );
}

function App() {
  return (
    <RecoilRoot>
      <StateRoot />
      <RecoilExternalState />
      <Theme>
        <ClientRoot>
          <SplitPane split="vertical" minSize={250}>
            <Panels />
            <Tabs />
          </SplitPane>
        </ClientRoot>
      </Theme>
    </RecoilRoot>
  );
}

export default App;
