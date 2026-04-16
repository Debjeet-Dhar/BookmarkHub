const Loginform = document.querySelector("#login-form");
const Signupform = document.querySelector("#signup-form");

function createUser() {
  return {
    getAllUsers: function () {
      let users = JSON.parse(localStorage.getItem("users")) || [];
      return users;
    },
    syncUser: function (updatedUser) {
      let users = this.getAllUsers();

      const index = users.findIndex((u) => u._id === updatedUser._id);

      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem("users", JSON.stringify(users));
      }

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    },
    addNewUser: function (name, email, password, Cpassword) {
      if (this.cheaKPassword(password, Cpassword)) {
        const newUser = {
          _id: Date.now(),
          username: name,
          email,
          password: btoa(password),
          tasks: [],
        };
        let users = this.getAllUsers();
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
      }
    },
    cheaKPassword: function (password, Cpassword) {
      return password === Cpassword;
    },
    getUser: function (email, password) {
      let users = this.getAllUsers();
      return users.find(
        (user) => user.email === email && user.password === btoa(password),
      );
    },
    getUserByEmail: function (email) {
      let users = this.getAllUsers();
      return users.find((user) => user.email === email);
    },
    updateProfile: function (name, email, bio) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        currentUser.username = name;
        currentUser.email = email;
        currentUser.bio = bio;
        this.syncUser(currentUser);
      }
    },
    renderui: function () {
      if (localStorage.getItem("currentUser")) {
        document.getElementById("auth-switch-card").style.display = "none";
        document.getElementById("manager-section").classList.remove("hidden");
      } else {
        // make after sign up open login sectin
        document.getElementById("auth-switch-card").style.display = "block";
        document.getElementById("manager-section").classList.add("hidden");
      }
    },

    logout: function () {
      localStorage.removeItem("currentUser");
      alert("Logout successful!");
      this.renderui();
    },

    renderTasks: function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser?.tasks.length === 0) {
        document.querySelector(".empty-state-demo").style.display = "block";
      }
      if (currentUser) {
        const tasksContainer = document.getElementById("booKGrid");
        tasksContainer.innerHTML = "";
        currentUser.tasks.forEach((task, index) => {
          // main card
          const card = document.createElement("div");
          card.className = "bookmark-card";

          // header
          const header = document.createElement("div");
          header.className = "card-header";

          const titleCategory = document.createElement("div");
          titleCategory.className = "title-category";

          const title = document.createElement("h3");
          title.textContent = task.title || `Bookmark ${index + 1}`;

          const badge = document.createElement("span");
          badge.className = "category-badge";
          badge.innerHTML = `<i class="fas fa-${task.category?.toLowerCase() || "general"}"></i> ${task.category || "General"}`;

          titleCategory.append(title, badge);

          // actions
          const actions = document.createElement("div");
          actions.className = "card-actions";

          const editBtn = document.createElement("label");
          editBtn.htmlFor = "updateBookmarkModalTrigger";
          editBtn.className = "icon-btn update";
          editBtn.style.cursor = "pointer";
          editBtn.innerHTML = `<i class="fas fa-edit"></i>`;

          const deleteBtn = document.createElement("label");
          deleteBtn.dataset.index = index;
          deleteBtn.className = "icon-btn remove";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

          actions.append(editBtn, deleteBtn);

          header.append(titleCategory, actions);

          // description
          const desc = document.createElement("div");
          desc.className = "description";
          desc.textContent = task.description || "No description provided.";

          // link
          const link = document.createElement("a");
          link.href = task.url || "https://tailwindcss.com/docs";
          link.target = "_blank";
          link.className = "url-link";
          link.innerHTML = `<i class="fas fa-link"></i> ${task.url || "https://tailwindcss.com/docs"}`;

          // footer
          const footer = document.createElement("div");
          footer.className = "meta-footer";

          const time = document.createElement("span");
          time.innerHTML = `<i class="far fa-clock">
          </i> Added on ${new Date(task.createdAt).toLocaleDateString()}`;

          const noteBtn = document.createElement("label");
          noteBtn.style.color = "#2c5f8a";
          noteBtn.style.cursor = "pointer";
          noteBtn.innerHTML = `<i class="far fa-sticky-note"></i> Add note`;

          footer.append(time, noteBtn);

          // assemble
          card.append(header, desc, link, footer);
          tasksContainer.appendChild(card);
        });
      }
    },
    createTask: function (title, description, url, category) {
      const Newtask = {
        title: title,
        description: description,
        url: url,
        category: category,
        createdAt: new Date(),
      };
      this.addTask(Newtask);
    },

    addTask: function (task) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        currentUser.tasks.push(task);

        this.syncUser(currentUser); // ✅ IMPORTANT

        this.renderTasks();
        document.querySelector(".empty-state-demo").style.display = "none";
        alert("Bookmark added successfully!");
      }
    },
    removeTask: function (taskIndex) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (currentUser) {
        currentUser.tasks.splice(taskIndex, 1);
        this.syncUser(currentUser);
        this.renderTasks(); // ✅ add this
      }
    },

    updateTask: function (index, title, description, url, category) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        currentUser.tasks[index] = {
          title,
          description,
          url,
          category,
          createdAt: new Date(),
        };
        this.syncUser(currentUser);
        this.renderTasks(); // ✅ add this
      }
    },
  };
}

const userManager = createUser();
userManager.renderui();
userManager.renderTasks();


Loginform.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = e.target.querySelector(".email").value;
  const password = e.target.querySelector(".password").value;

  const user = userManager.getUser(email, password);
  if (user) {
    alert("Login successful!");
    localStorage.setItem("currentUser", JSON.stringify(user));
    userManager.renderui();
  } else {
    alert("Invalid email or password.");
  }
});

Signupform.addEventListener("submit", function (e) {
  e.preventDefault();
  try {
    const name = e.target.querySelector(".name").value;
    const email = e.target.querySelector(".email").value;
    const password = e.target.querySelector(".password").value;
    const Cpassword = e.target.querySelector(".confirm-password").value;

    const existingUser = userManager.getUserByEmail(email);
    if (existingUser) {
      alert("User already exists!");
      return;
    }
    userManager.addNewUser(name, email, password, Cpassword);
    alert("Signup successful!");
    alert("Please login to continue....");
    document.getElementById("login-tab").checked = true;
    userManager.renderui();
    Signupform.reset();
  } catch (error) {
    console.log("err from signup", error);
  }
});


document
  .getElementById("updateProfileModalTrigger")
  ?.addEventListener("click", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      confirm("Do you want to logout?") && userManager.logout();
    }
  });

document
  .getElementById("addBookmarkBtn")
  ?.addEventListener("click", function (e) {
    const title = document.querySelector(".bookmark-title").value;
    const description = document.querySelector(".bookmark-description").value;
    const url = document.querySelector(".bookmark-url").value;
    const category = document.querySelector(".bookmark-category").value;

    userManager.createTask(title, description, url, category);
    // Close modal
    document.getElementById("addBookmarkModalTrigger").checked = false;
    // Reset inputs
    document.querySelector(".bookmark-title").value = "";
    document.querySelector(".bookmark-description").value = "";
    document.querySelector(".bookmark-url").value = "";
    document.querySelector(".bookmark-category").value = "";
  });

document
  .getElementById("updateBookmarkBtn")
  ?.addEventListener("click", function (e) {
    const title = document.querySelector(".bookmark-title").value;
    const description = document.querySelector(".bookmark-description").value;
    const url = document.querySelector(".bookmark-url").value;
    const category = document.querySelector(".bookmark-category").value;

    userManager.updateTask(title, description, url, category);
    // Close modal
    document.getElementById("updateBookmarkModalTrigger").checked = false;

    // Reset inputs
    document.querySelector(".bookmark-title").value = "";
    document.querySelector(".bookmark-description").value = "";
    document.querySelector(".bookmark-url").value = "";
    document.querySelector(".bookmark-category").value = "";
  });



document.getElementById("booKGrid").addEventListener("click", function (e) {
  const deleteBtn = e.target.closest(".remove");

  if (deleteBtn) {
    const index = deleteBtn.dataset.index;

    const confirmDelete = confirm("Delete this bookmark?");
    if (confirmDelete) {
      userManager.removeTask(index);
    }
  }
});
