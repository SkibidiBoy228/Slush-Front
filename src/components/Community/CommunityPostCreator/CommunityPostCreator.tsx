import { useState } from "react";
import type { CommunityPostType } from "../../../types/community";
import "./CommunityPostCreator.css";

interface CommunityPostCreatorProps{
    onSubmit: (data:{
        postType: CommunityPostType;
        title: string;
        content: string;
        shortDescription: string;
    }) => void;
}

function CommunityPostCreator({
    onSubmit,
}: CommunityPostCreatorProps){
    const [isOpen, setIsOpen] = useState(false);
    const [postType, setPostType] = useState<CommunityPostType>("Discussion");
    const [title, setTitle] = useState("");
    const [content,setContent] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const handleSumbit = (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        if(!title.trim() && !content.trim()){
            return;
        }
        onSubmit({
            postType,
            title: title.trim(),
            content: content.trim(),
            shortDescription: shortDescription.trim(),
        });
        setTitle("");
        setContent("");
        setShortDescription("");
        setPostType("Discussion");
        setIsOpen(false);
    };
    return (
        <section className="community-post-creator">
            {!isOpen ? (
                <button className="community-create-button" onClick={()=>setIsOpen(true)}>
                    <span className="community-create-icon">+</span>
                    <span>Створити публікацію</span>
                </button>
            ) :(
                <form className="community-post-creator-form" onClick={handleSumbit}>
                    <div className="community-post-creator-header">
                        <h2>Створити публікацію</h2>
                        <button type = "button"
                            className="community-post-creator-close"
                            onClick={()=>setIsOpen(false)}>
                                ×
                            </button>
                    </div>
                    <div className="community-post-type">
                        <label htmlFor="community-post-type">
                            Тип публікації
                        </label>
                        <select
                            id ="community-post-type"
                            value={postType}
                            onChange={(event) =>
                                setPostType(event.target.value as CommunityPostType)
                            }
                         >
                              <option value="Discussion">Обговерення</option>
                              <option value="Screenshot">Скріншот</option>
                              <option value="Video">Відео</option>  
                              <option value="Guide">Посібник</option>
                              <option value="News">Новини</option>
                        </select>
                    </div>
                    <div className="community-post-field">
                        <label htmlFor="community-post-title">
                            Заголовок
                        </label>
                        <input id="community-post-title"
                            type = "text"
                            value={title}
                            onChange={(event)=>setTitle(event.target.value)}
                            placeholder="Заголовок публікації"
                            maxLength={200}
                        />
                    </div>
                    <div className="community-post-field">
                        <label htmlFor="community-post-description">
                            Короткий опис
                        </label>
                        <input id="community-post-description"
                            type="text"
                            value={shortDescription}
                            onChange={(event)=>setShortDescription(event.target.value)}
                            placeholder="Коротко про публікацію"
                            maxLength={300}
                        />
                    </div>
                    <div className="community-post-field">
                        <label htmlFor="community-post-content">
                            Текст
                        </label>
                        <textarea id="community-post-content"
                            value={content}
                            onChange={(event)=> setContent(event.target.value)}
                            placeholder="Напишіть щось..."
                            rows={6}
                            />
                    </div>
                    <div className="community-post-creator-actions">
                        <button type="button" className="community-post-cancel" onClick={()=>setIsOpen(false)}>
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="community-post-submit"
                            disabled={!title.trim() && !content.trim()}
                        >
                            Опублікувати
                        </button>
                    </div>
                </form>

            )}
        </section>
    )
}
export default CommunityPostCreator;