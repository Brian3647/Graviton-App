import { Tab } from "../modules/tab";
import CodeMirror from "../components/codemirror";
import { EditorState } from "@codemirror/state";

interface CodeMirrorContainerOptions {
  initialContent: string;
  savedState: any;
  saveState: (state: any) => void;
}

function CodemirrorContainer({
  initialContent,
  savedState,
  saveState,
}: CodeMirrorContainerOptions) {
  return (
    <CodeMirror
      scrollPos={savedState.scrollHeight}
      state={savedState.codemirrorState}
      onUpdate={(view) => {
        saveState({
          codemirrorState: view.state,
        });
      }}
      onScroll={(scroll) => {
        saveState({
          scrollHeight: scroll,
        });
      }}
      initialValue={initialContent}
    />
  );
}

interface SavedState {
  scrollHeight: number;
  codemirrorState: EditorState | null;
}

/**
 * A tab that displays a CodeMirror editor inside it
 */
class TextEditorTab extends Tab {
  private state: SavedState = {
    scrollHeight: 0,
    codemirrorState: null,
  };

  /**
   *
   * @param path - Path of the opened file
   * @param initialContent - Current content of the file
   */
  constructor(path: string, initialContent: string) {
    super(path);

    const saveState = (state: SavedState) => {
      this.state = {
        ...this.state,
        ...state,
      };
    };

    this.container = () => (
      <CodemirrorContainer
        savedState={this.state}
        initialContent={initialContent}
        saveState={saveState}
      />
    );
  }
}

export default TextEditorTab;
