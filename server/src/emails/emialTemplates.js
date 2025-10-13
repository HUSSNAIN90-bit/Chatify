export function createWellcomeEmailTemplate(name, clientUrl) {
    return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Messenger</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  </head>
  <body class="flex items-center flex-col">
    <header class="bg-[skyblue] w-full display flex justify-center items-center flex-col gap-5 p-20">
      <div class="bg-white border-6 border-gray-700 rounded-full p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100px"
          height="100px"
          viewBox="0 0 125 125"
          fill="none"
        >
          <rect x="14" y="14" width="97" height="97" fill="white" />
          <mask id="path-2-inside-1" fill="white">
            <rect x="22" y="35" width="82" height="55" rx="2" />
          </mask>
          <rect
            x="22"
            y="35"
            width="82"
            height="55"
            rx="2"
            stroke="#3F3F3F"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
            mask="url(#path-2-inside-1)"
          />
          <path
            d="M64.3093 68.8661C63.5578 69.517 62.4422 69.517 61.6907 68.8661L29.8161 41.2619C28.4162 40.0496 29.2736 37.75 31.1254 37.75L94.8747 37.75C96.7264 37.75 97.5838 40.0496 96.1839 41.2619L64.3093 68.8661Z"
            fill="url(#paint0_linear)"
          />
          <path
            d="M36 47L63.5 70L91 47"
            stroke="#3F3F3F"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="69"
              y1="87.5"
              x2="63"
              y2="38"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#34F0E5" />
              <stop offset="0.932292" stop-color="#34ECE1" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="text-3xl text-white">
        Welcome to 
            Messenger
        </span>
      </h1>
    </header>
    <main class="py-20 px-5 max-w-[600px]">
        <h1 class="text-[#5656b8] font-bold text-2xl mb-5">
            Hello ${name},
        </h1>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia sunt ex ut iste, recusandae, nesciunt doloribus soluta facilis quia quidem velit quod vel numquam aliquam similique aspernatur ipsam dolorum maiores.
        </p>
        <div class="bg-gray-200 rounded-lg p-3 border-l-8 mt-10 border-[skyblue]">
            <h2 class="text-2xl font-bold">
                Get Started in just a few steps
            </h2>
            <ul class="flex flex-col gap-3 list-disc pl-5">
                <li>
                    Setup your profile
                </li>
                <li>
                    Find and your contacts  
                </li>
                <li>Start a conversation</li>
                <li>Share photos, videos, and more</li>
            </ul>
        </div>
        <div class="flex justify-center mt-10">
            <a href="${clientUrl}" class="text-2xl bg-[skyblue] hover:bg-[#6cccf1] hover:scale-[1.05] rounded-full py-3 px-7 font-medium flex justify-center items-center text-white ">Open Messenger</a>
        </div>
        <div class="mt-10">
            <p>
               Corporis quam beatae, unde fugiat animi quis, temporibus dolore amet quibusdam hic perspiciatis iusto enim itaque vitae, blanditiis ullam asperiores aliquid commodi?
            </p>
            <div class="mt-5">

                <p>Best regards</p>
                <p>The messenger Team</p>
            </div>
        </div>
    </main>
  </body>
</html>
`
}