import postIcon from "../images/post.svg";
let rows = [];

window.addEventListener("load", () => {
  const ordersPage = document.querySelector(".orders-page");
  if (!ordersPage) return;

  const observer = new MutationObserver((mutationsList, observer) => {
    const observedRows = document.querySelectorAll(".panel-body-row");
    if (observedRows.length === 0) return;
    if (rows.length === observedRows.length) return;

    rows = [...observedRows];

    rows.forEach((row) => {
      const flagImgRightRef = row.querySelector(".flag-img-right");

      if (!flagImgRightRef) return;

      const deliveryToggleRef = row.querySelector("[data-content-toggle]");
      const buttonRef = document.createElement("div");
      buttonRef.style.cursor = "pointer";
      buttonRef.style.height = "14px";
      buttonRef.style.textAlign = "center";
      buttonRef.innerHTML = postIcon;

      flagImgRightRef.appendChild(buttonRef);

      buttonRef.addEventListener("click", (e) => {
        e.stopPropagation();
        // disconnect observer to stop observing DOM mutations
        observer.disconnect();
        deliveryToggleRef.click();

        setTimeout(() => {
          const rawName = row.querySelector(".address .name")?.textContent ?? "";
          const name = rawName
            .split(" ")
            .map((word) => {
              const [firstLetter, ...otherLetters] = word.split("");
              return `${firstLetter?.toUpperCase()}${otherLetters.join("")}`;
            })
            .join(" ");
          chrome.storage.sync.set(
            {
              recipient: {
                name,
                email: row.querySelector("[href^='mailto:']")?.textContent ?? "",
                firstLine: row.querySelector(".address .first-line")?.textContent ?? "",
                secondLine: row.querySelector(".address .second-line")?.textContent ?? "",
                city: row.querySelector(".address .city")?.textContent ?? "",
                state: row.querySelector(".address .state")?.textContent ?? "",
                zip: row.querySelector(".address .zip")?.textContent ?? "",
                country: row.querySelector(".address .country-name")?.textContent ?? "",
                quantity:
                  +row.querySelector(".flag.mt-xs-2 .list-unstyled.text-body-smaller .strong")?.textContent ?? 1,
              },
            },
            () => {
              chrome.runtime.sendMessage({ type: "SET_RECIPIENT" });
              deliveryToggleRef.click();
            }
          );
        }, 0);
      });
    });
  });
  // Start observing the target node for configured mutations
  observer.observe(ordersPage, { subtree: true, childList: true });
});
