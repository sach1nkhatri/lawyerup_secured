import React from 'react';
import styles from '../css/ChatView.module.css';
import ChatHeader from '../component/ChatHeader';
import ChatBody from '../component/ChatBody';
import ChatInputBox from '../component/ChatInputBox';
import ChatFooter from '../component/ChatFooter';

const ChatView = ({
                      messages,
                      input,
                      setInput,
                      handleSend,
                      textareaRef,
                      isGenerating,
                      responseTime,
                      title,
                      model,
                      setModel,
                      setShowPdfUpload,
                      onNewChat,
                      onLoadChat,
                  }) => {
    return (
        <div className={styles.chatViewWrapper}>
            <ChatHeader
                title={title}
                selectedModel={model}
                onModelChange={setModel}
                onNewChat={onNewChat}
                onLoadChat={onLoadChat}
            />

            <ChatBody
                messages={messages}
                isGenerating={isGenerating}
                responseTime={responseTime}
            />

            <div className={styles.chatInputSection}>
                <ChatInputBox
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    textareaRef={textareaRef}
                    onUploadClick={() => setShowPdfUpload(true)}
                />
                <ChatFooter />
            </div>
        </div>
    );
};

export default ChatView;
