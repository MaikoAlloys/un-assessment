import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/admin-dashboard",
    name: "AdminDashboard",
    component: () => import("../views/AdminDashboard.vue"),
    meta: {
      requiresAuth: false,
      title: "AdminDashboard",
    },
  },

    {
    path: "/projects",
    name: "Projects",
    component: () => import("../views/UnProjects.vue"),
    meta: {
      requiresAuth: false,
      title: "Projects",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
