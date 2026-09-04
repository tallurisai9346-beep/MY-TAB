// export function setupCounter(element) {
//   let counter = 0
//   const setCounter = (count) => {
//     counter = count
//     element.innerHTML = `Count is ${counter}`
//   }
//   element.addEventListener('click', () => setCounter(counter + 1))
//   setCounter(0)
// }
export function setupCounter(element) {
  let count = 0;

  element.textContent = "Count is 0";

  element.addEventListener("click", function () {
    count = count + 1;

    element.textContent = "Count is " + count;
  });
}
