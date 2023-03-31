# Python program to convert speech to text

import speech_recognition as sr
r = sr.Recognizer()

with sr.Microphone() as source:
    print("Give you answer :")
    audio = r.listen(source)
    try:
        text = r.recognize_google(audio)
        print(text)
    except:
        print("Sorry could not recognize what you said")
