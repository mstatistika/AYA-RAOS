(() => {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const cards = [
        ...document.querySelectorAll(
          ".info-card[id]"
        )
      ];

      const links = [
        ...document.querySelectorAll(
          ".info-nav a[href^='#']"
        )
      ];

      if (
        !cards.length ||
        !links.length
      ) {
        return;
      }

      const setActive = id => {
        links.forEach(link => {
          const isActive =
            link.getAttribute("href") ===
            `#${id}`;

          link.classList.toggle(
            "active",
            isActive
          );

          if (isActive) {
            link.setAttribute(
              "aria-current",
              "location"
            );
          } else {
            link.removeAttribute(
              "aria-current"
            );
          }
        });
      };

      links.forEach(link => {
        link.addEventListener(
          "click",
          () => {
            setActive(
              link
                .getAttribute("href")
                .slice(1)
            );
          }
        );
      });

      const initialId =
        window.location.hash
          .replace("#", "");

      if (
        initialId &&
        cards.some(
          card =>
            card.id === initialId
        )
      ) {
        setActive(initialId);
      } else {
        setActive(cards[0].id);
      }

      if (
        !("IntersectionObserver" in window)
      ) {
        return;
      }

      const headerHeight =
        parseFloat(
          getComputedStyle(
            document.documentElement
          ).getPropertyValue(
            "--aya-header-height"
          )
        ) || 82;

      const observer =
        new IntersectionObserver(
          entries => {
            const visible =
              entries
                .filter(
                  entry =>
                    entry.isIntersecting
                )
                .sort(
                  (a, b) =>
                    a.boundingClientRect
                      .top -
                    b.boundingClientRect
                      .top
                );

            if (visible[0]) {
              setActive(
                visible[0]
                  .target
                  .id
              );
            }
          },
          {
            rootMargin:
              `-${headerHeight + 20}px ` +
              "0px -62% 0px",

            threshold:
              [0, 0.1, 0.35]
          }
        );

      cards.forEach(card =>
        observer.observe(card)
      );
    }
  );
})();
