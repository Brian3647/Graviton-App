use serde::{
    Deserialize,
    Serialize,
};

use crate::filesystems::FileInfo;
use crate::{
    Errors,
    State,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "msg_type")]
pub enum Messages {
    // When a frontend listens for changes in a particular state
    // The core will sent the current state for it's particular ID if there is anyone
    // If not, a default state will be sent
    ListenToState {
        // The message author, Core | Client
        trigger: String,
        // The state ID
        state_id: u8,
    },
    StateUpdated {
        state: State,
    },
    ShowPopup {
        state_id: u8,
        popup_id: u8,
        content: String,
        title: String,
    },
}

impl Messages {
    pub fn get_state_id(&self) -> u8 {
        match self {
            Self::ListenToState { state_id, .. } => *state_id,
            Self::StateUpdated { state } => state.id,
            Self::ShowPopup { state_id, .. } => *state_id,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ExtensionMessages {
    CoreMessage(Messages),
    ReadFile(u8, Result<FileInfo, Errors>),
}

impl ExtensionMessages {
    pub fn get_state_id(&self) -> u8 {
        match self {
            Self::CoreMessage(msg) => msg.get_state_id(),
            Self::ReadFile(state_id, ..) => *state_id,
        }
    }
}
