import { useState } from "react";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import axios from "axios";

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobURL: string) => {
    setIsLoading(true);

    // Append recorded messages to messages array
    const myMessage = { sender: "me", blobURL };
    const messageArr = [...messages, myMessage];

    // Convert Blob URL to Blob object
    fetch(blobURL)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");

        // Send form data to API endpoint
        await axios
          .post("http://localhost:8000/post-audio", formData, {
            headers: { "content-type": "audio/mpeg" },
            responseType: "arraybuffer",
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            // Append to audio
            const vivMessage = { sender: "Vivi", blobURL: audio.src };
            messageArr.push(vivMessage);
            setMessages(messageArr);

            // Play Audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err) => {
            console.error(err.message);
            setIsLoading(false);
          });
      });

    // setIsLoading(false);
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={setMessages} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* conversation */}
        <div className="mt-5 px-5">
          {messages.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={
                  "flex flex-col " +
                  (audio.sender == "Vivi" && "flex items-end")
                }
              >
                {/* sender */}
                <div className="mt-4">
                  <p
                    className={
                      audio.sender == "Vivi"
                        ? "text-right italic mr-2 text-pink-600"
                        : "ml-2 italic text-purple-700"
                    }
                  >
                    {audio.sender}
                  </p>
                  {/* Audio Message */}
                  <audio
                    src={audio.blobURL}
                    className="appearance-none"
                    controls
                  />
                </div>
              </div>
            );
          })}

          {messages.length == 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">
              {" "}
              Send Vivi A Message...
            </div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
              {" "}
              Vivi Is Thinking...
            </div>
          )}
        </div>

        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-purple-700 to-pink-600">
          <div className="flex justify-center items-center w-full">
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
