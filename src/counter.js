export function setupCounter(element) {
  let count = 0;

  element.textContent = "Count is 0";

  element.addEventListener("click", function () {
    count = count + 1;

    element.textContent = "Count is " + count;
  });
}

