import {initModal} from "./modules/addModal.js";
import {initRemovalModal} from "./modules/removeModal.js";
import {initHeader} from "./modules/header.js";
import initFinance from "./modules/finance.js";
import initDropDownMenu from "./modules/dropdown-menu.js";
import {initSettingsModal} from "./modules/settingsModal.js";

initDropDownMenu();
initFinance();
initModal();
initRemovalModal();
initHeader();

initSettingsModal();

