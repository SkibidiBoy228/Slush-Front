import { useState } from "react";

import SettingsSidebar, {type SettingsSection} from "../../components/Settings/SettingsSidebar/SettingsSidebar";

import GeneralSettings from "../../components/Settings/GeneralSettings/GeneralSettings";
import NotificationSettings from "../../components/Settings/NotificationSettings/NotificationSettings";
import PasswordSettings from "../../components/Settings/PasswordSettings/PasswordSettings";
import WalletSettings from "../../components/Settings/WalletSettings/WalletSettings";
import DeleteAccount from "../../components/Settings/DeleteAccount/DeleteAccounts";

import "./Settings.css";

function Settings(){
    const [activeSection, setActiveSection] = useState<SettingsSection>("general");
    function renderSection(){
        switch(activeSection){
            case "general":
                return <GeneralSettings/>;
            case "notifications":
                return <NotificationSettings/>;
            case "password":
                return <PasswordSettings/>;
            case "wallet":
                return <WalletSettings/>;
            case "delete-account":
                return <DeleteAccount/>;
            default:
                return <GeneralSettings/>;
        }
    }
    return(
        <main className="settings-page">
            <div className="settings-container">
                <SettingsSidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    />
                <section className="settings-content">
                    {renderSection()}
                </section>
            </div>
        </main>
    )
}
export default Settings;