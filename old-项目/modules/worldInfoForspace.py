import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json

class WorldEditor(tk.Frame):
    def __init__(self, root):
        super().__init__(root)  
        self.root = root
        self.data = {}
        self.landmark_entries = []
        self.force_entries = {}
        
        self.setup_ui()

    def setup_ui(self):
        """创建世界书编辑界面"""
        canvas = tk.Canvas(self)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # 基本信息
        base_frame = ttk.LabelFrame(scrollable_frame, text="基本信息")
        base_frame.pack(padx=10, pady=5, fill="x")

        ttk.Label(base_frame, text="名称：").grid(row=0, column=0, sticky="w")
        self.name_entry = ttk.Entry(base_frame)
        self.name_entry.grid(row=0, column=1, sticky="ew")

        ttk.Label(base_frame, text="所属空间：").grid(row=0, column=2, sticky="w")
        self.space_entry = ttk.Entry(base_frame)
        self.space_entry.grid(row=0, column=3, sticky="ew")

        # 关键词
        keywords_frame = ttk.LabelFrame(scrollable_frame, text="关键词（每行一条）")
        keywords_frame.pack(padx=10, pady=5, fill="x")
        self.keywords_text = tk.Text(keywords_frame, height=3)
        self.keywords_text.pack(fill="x")

        # 介绍
        info_frame = ttk.LabelFrame(scrollable_frame, text="介绍（每行一段）")
        info_frame.pack(padx=10, pady=5, fill="x")
        self.info_text = tk.Text(info_frame, height=4)
        self.info_text.pack(fill="x")

        # 地标
        landmark_frame = ttk.LabelFrame(scrollable_frame, text="地标")
        landmark_frame.pack(padx=10, pady=5, fill="x")
        self.landmark_container = ttk.Frame(landmark_frame)
        self.landmark_container.pack(fill="x")
        ttk.Button(landmark_frame, text="+ 添加地标", command=self.add_landmark).pack()

        # 势力
        force_frame = ttk.LabelFrame(scrollable_frame, text="势力")
        force_frame.pack(padx=10, pady=5, fill="x")
        self.force_container = ttk.Frame(force_frame)
        self.force_container.pack(fill="x")
        ttk.Button(force_frame, text="+ 添加势力", command=self.add_force).pack()

    def load_world(self):
        """加载世界书 JSON"""
        filepath = filedialog.askopenfilename(filetypes=[("JSON文件", "*.json")])
        if not filepath:
            return

        with open(filepath, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

        self.populate_data()

    def populate_data(self):
        """填充界面数据"""
        self.name_entry.delete(0, tk.END)
        self.name_entry.insert(0, self.data.get("name", ""))
        self.space_entry.delete(0, tk.END)
        self.space_entry.insert(0, self.data.get("space", ""))

        self.keywords_text.delete("1.0", tk.END)
        self.keywords_text.insert("1.0", "\n".join(self.data.get("keywords", [])))

        self.info_text.delete("1.0", tk.END)
        self.info_text.insert("1.0", "\n".join(self.data.get("info", [])))

        # 地标
        for widget in self.landmark_container.winfo_children():
            widget.destroy()
        self.landmark_entries.clear()

        for landmark in self.data.get("landmark", []):
            self.add_landmark(landmark)

        # 势力
        for widget in self.force_container.winfo_children():
            widget.destroy()
        self.force_entries.clear()

        for force_name, details in self.data.get("force", {}).items():
            self.add_force(force_name, details)

    def save_world(self):
        """保存世界书 JSON"""
        self.collect_data()
        filepath = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON文件", "*.json")])
        if not filepath:
            return

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

        messagebox.showinfo("成功", "世界书保存成功！")

    def collect_data(self):
        """收集界面数据"""
        self.data = {
            "name": self.name_entry.get(),
            "space": self.space_entry.get(),
            "keywords": self.keywords_text.get("1.0", tk.END).strip().split("\n"),
            "info": self.info_text.get("1.0", tk.END).strip().split("\n"),
            "landmark": [entry.get() for entry in self.landmark_entries if entry.get()],
            "force": {name: details for name, details in self.force_entries.items() if name}
        }

    def add_landmark(self, name=""):
        """添加地标输入框"""
        entry = ttk.Entry(self.landmark_container)
        entry.insert(0, name)
        entry.pack(fill="x", pady=2)
        self.landmark_entries.append(entry)
    

    def add_force(self, name="", details=None):
        """添加势力"""
        frame = ttk.Frame(self.force_container)
        frame.pack(fill="x", pady=2)

        ttk.Label(frame, text="势力名：").pack(side="left")
        name_entry = ttk.Entry(frame, width=20)
        name_entry.insert(0, name)
        name_entry.pack(side="left")

        members_text = tk.Text(frame, height=3, width=30)
        members_text.pack(side="left", padx=5)
        members_text.insert("1.0", "\n".join(details.get("member", [])) if details else "")

        desc_text = tk.Text(frame, height=3, width=30)
        desc_text.pack(side="left", padx=5)
        desc_text.insert("1.0", "\n".join(details.get("info", {}).get("势力描述", [])) if details else "")

        self.force_entries[name_entry.get()] = {
            "member": members_text.get("1.0", tk.END).strip().split("\n"),
            "info": {"势力描述": desc_text.get("1.0", tk.END).strip().split("\n")}
        }
        
    #     # 创建删除条目按钮
    #     delete_button = ttk.Button(frame, text="删除", command=lambda: self.delete_force(frame, name_entry))
    #     delete_button.pack(side="right")
        
    # def delete_force(self, frame, name_entry):
    #     """删除势力"""
    #     frame.destroy()
    #     del self.force_entries[name_entry.get()]
