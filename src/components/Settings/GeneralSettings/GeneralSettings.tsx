import { useEffect, useRef, useState } from "react";

import {
    getProfileSettings,
    updateProfileSettings,
} from "../../../api/settings";

import { uploadBanner, uploadAvatar } from "../../../api/profile";

import type { ProfileSettings } from "../../../types/settings";

import "./GeneralSettings.css";

function GeneralSettings(){
    const [profile, setProfile] = useState<ProfileSettings | null>(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [language, setLanguage] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true); 
    const [saving, setSaving] = useState(false);
    const [message,setMessage] = useState("");
    const [error, setError] = useState("");
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(()=>{
        loadProfile();
    }, []);

    useEffect(()=>{
        return () =>{
            if(avatarPreview){
                URL.revokeObjectURL(avatarPreview);
            }
            if(bannerPreview){
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [avatarPreview, bannerPreview]);

    async function loadProfile() {
        try{
            setLoading(true);
            setError("");

            const data = await getProfileSettings();
            setProfile(data);
            setUsername(data.username);
            setEmail(data.email);
            setBio(data.bio);
            setLanguage(data.language);
        }catch(err){
            if(err instanceof Error){
                setError(err.message);
            }else{
                setError("Не вдалося завантажити налаштування профілю");
            }
        }finally{
            setLoading(false);
        }
    }
    function handleAvatarChange(
        event: React.ChangeEvent<HTMLInputElement>
    ){
        const file = event.target.files?.[0];
        if(!file) return;
        if(avatarPreview){
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setMessage("");
        setError("");
    }
    function handleBannerChange(
        event : React.ChangeEvent<HTMLInputElement>
    ){
        const file = event.target.files?.[0];
        if(!file) return;
        if(bannerPreview){
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setMessage("");
        setError("");
    }
    async function handleSave() {
        try{
            setSaving(true);
            setMessage("");
            setError("");
            if(!username.trim()){
                setError("Введіть імя користувача.");
                return;
            }
            if(!email.trim()){
                setError("Введіть e-mail.");
                return;
            }
            if(bio.length > 100){
                setError("Опис не може містити більше 100 символів");
                return;
            }
            if(avatarFile){
                await uploadAvatar(avatarFile);
            }
            if(bannerFile){
                await uploadBanner(bannerFile);
            }
            await updateProfileSettings({
                username: username.trim(),
                email: email.trim(),
                bio,
                language,
            });
            const updatedProfile: ProfileSettings ={
                username: username.trim(),
                email: email.trim(),
                bio,
                language,
                avatarUrl: avatarPreview ?? profile?.avatarUrl ?? "",
                coverUrl: bannerPreview ?? profile?.coverUrl ?? "",
            };
            setProfile(updatedProfile);
            setAvatarFile(null);
            setBannerFile(null);
            if(avatarPreview){
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
            }
            if(bannerPreview){
                URL.revokeObjectURL(bannerPreview);
                setBannerPreview(null);
            }
            if(avatarInputRef.current){
                avatarInputRef.current.value = "";
            }
            if(bannerInputRef.current){
                bannerInputRef.current.value = "";
            }
            setMessage("Налаштування збережено.");
        }catch (err){
            if(err instanceof Error){
                setError(err.message);
            }else{
                setError("Не вдалося зберегти налаштування.");
            }
        }finally{
            setSaving(false);
        }
    }
    function handleCancel(){
        if(!profile) return;
        setUsername(profile.username);
        setEmail(profile.email);
        setBio(profile.bio);
        setLanguage(profile.language);

        setAvatarFile(null);
        setBannerFile(null);
        if(avatarPreview){
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(null);
        }
        if(bannerPreview){
            URL.revokeObjectURL(bannerPreview);
            setBannerPreview(null);
        }
        if(avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
        if(bannerInputRef.current){
            bannerInputRef.current.value = "";
        }
        setMessage("");
        setError("");
    }
    if(loading){
        return (
            <section className="general-settings">
                <div className="general-settings-loading">
                    Завантаження...
                </div>
            </section>
        );
    }
    if(!profile){
        return(
            <section className="general-settings">
                <div className="general-settings-error">
                    {error || "Не вдалося завантажити профіль."}
                </div>
            </section>
        )
    }
    const currentAvatar = avatarPreview || profile.avatarUrl || "";
    const currentBanner = bannerPreview || profile.coverUrl || "";
    return(
        <section className="general-settings">
            <div className="general-settings-header">
                <h1>Загальні налаштування</h1>
                <p>Керуйте основню інформацією свого профілю.</p>
            </div>
            <div className="genral-settings-profile">
                <div className="general-settings-banner">
                    {currentBanner ? (
                        <img src = {currentBanner}
                        alt="Обкладинка профілю"/>
                    ) : (
                        <div className="general-settings-banner-empty"/>
                    )}
                    <button type = 'button'
                        className="general-settings-image-button general-settings-banner-button"
                        onClick={()=>bannerInputRef.current?.click()}>
                            Змінити обкладинку
                        </button>
                    
                    <input ref = {bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        hidden/>
                </div>
                <div className="general-settings-avatar-wrapper">
                    <div className="general-settings-avatar">
                        {currentAvatar ? (
                            <img src = {currentAvatar}
                             alt ={username}
                             />
                        ): (
                            <span>
                                {username.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <button type ='button'
                        className="general-settings-image-button"
                        onClick={()=>avatarInputRef.current?.click()}
                        >
                            Змінити аватар
                        </button>
                    <input ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                    />
                </div>
                <div className="general-settings-form">
                    <div className="general-settings-field">
                        <label htmlFor="settings-username">
                            Ім'я користувача
                        </label>
                        <input id="settings-username"
                            type="text"
                            value={username}
                            onChange={(event)=> setUsername(event.target.value)}
                            disabled={saving}
                            />
                    </div>
                    <div className="general-settings-field">
                        <label htmlFor="settings-email">
                            E-mail
                        </label>
                        <input id="settings-email"
                            type="email"
                            value={email}
                            onChange={(event)=>setEmail(event.target.value)}
                            disabled={saving}
                        />
                    </div>
                    <div className="general-settings-field">
                        <div className="general-settings-label-row">
                            <label htmlFor="settings-bio">
                                О себе
                            </label>
                            <span>{bio.length}/100</span>
                        </div>
                        <textarea id="settings-bio"
                            value={bio}
                            maxLength={100}
                            onChange={(event)=> setBio(event.target.value)}
                            disabled = {saving}
                            rows = {4}
                            />
                    </div>
                    <div className="general-settings-field">
                        <label htmlFor="settings-language">
                            Мова
                        </label>
                        <select id="settings-language"
                            value={language}
                            onChange={(event)=> setLanguage(event.target.value)}
                            disabled = {saving}
                            >
                                <option value="uk">Українська</option>
                                <option value="en">English</option>
                                <option value="sk">Slovenčina</option>
                                <option value="ru">Русский</option>
                            </select>
                    </div>
                </div>
            </div>
            {(message || error) && (
                <div className={error ? "general-settings-message general-settings-message-error" : "general-settings-message general-settings-message-success"}>
                    {error || message}
                </div>
            )}
            <div className="general-settings-actions">
                <button type="button"
                    className="general-settings-cancel"
                    onClick={handleCancel}
                    disabled={saving}>
                        Скасувати
                    </button>
                <button type="button"
                className="general-settings-save"
                onClick={handleSave}
                disabled={saving}>
                    {saving ? "Збереження..." : "Зберегти"}
                </button>
            </div>
        </section>
    )
}
export default GeneralSettings;