document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-right");
  const backdrop = document.querySelector(".nav-backdrop");

  if (!toggle || !nav || !backdrop) return;

  const open = () => {
    nav.classList.add("is-open");
    backdrop.classList.add("is-open");
    toggle.classList.add("is-open");              // ✅ 新增
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("sm-menu-open");
  };

  const close = () => {
    nav.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    toggle.classList.remove("is-open");           // ✅ 新增
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("sm-menu-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    if (isOpen) close();
    else open();
  });

  backdrop.addEventListener("click", close);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
});
