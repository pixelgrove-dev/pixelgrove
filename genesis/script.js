const surpriseButton = document.getElementById("surprise-button");
const surpriseMessage = document.getElementById("surprise-message");

surpriseButton.addEventListener("click", () => {
  surpriseMessage.classList.remove("hidden");
  surpriseMessage.classList.add("revealed");

  surpriseButton.textContent = "Surprise Opened 💜";

  surpriseMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  createConfetti();
});

function createConfetti() {
  const symbols = ["💜", "🐾", "✨", "🎉", "🎂"];

  for (let i = 0; i < 35; i++) {
    const piece = document.createElement("span");

    piece.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    piece.style.position = "fixed";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = "-40px";
    piece.style.zIndex = "999";
    piece.style.fontSize = `${Math.random() * 18 + 16}px`;
    piece.style.pointerEvents = "none";
    piece.style.transition =
      `transform ${Math.random() * 2 + 3}s linear,
       opacity ${Math.random() * 2 + 3}s ease`;

    document.body.appendChild(piece);

    requestAnimationFrame(() => {
      piece.style.transform =
        `translateY(110vh) rotate(${Math.random() * 720}deg)`;

      piece.style.opacity = "0";
    });

    setTimeout(() => {
      piece.remove();
    }, 5500);
  }
}