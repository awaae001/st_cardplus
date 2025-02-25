import tkinter as tk
from tkinter import ttk

def show_about():
    about_window = tk.Toplevel()
    about_window.title("关于")
    about_window.geometry("400x300")
    
    # 创建内容框架
    content_frame = ttk.Frame(about_window)
    content_frame.pack(padx=20, pady=20, fill="both", expand=True)
    
    # 标题
    title_label = ttk.Label(content_frame, text="简要角色卡填写器", font=("Arial", 16))
    title_label.pack(pady=10)
    
    # 版本信息
    version_label = ttk.Label(content_frame, text="版本: 0.2.2")
    version_label.pack()
    
    # 作者信息
    author_label = ttk.Label(content_frame, text="作者: awaae001 & Aki")
    author_label.pack(pady=10)
    
    # 版权信息
    copyright_label = ttk.Label(content_frame, text="© 2025 版权所有")
    copyright_label.pack()
    
    # 免责声明
    disclaimer_label = ttk.Label(content_frame, 
        text="本软件仅供学习交流使用，\n未经许可严禁转载倒卖！",
        justify="center")
    disclaimer_label.pack(pady=20)
    
    # 关闭按钮
    close_button = ttk.Button(content_frame, text="关闭", command=about_window.destroy)
    close_button.pack()

if __name__ == "__main__":
    show_about()
