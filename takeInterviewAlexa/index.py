import json
import openai
import pymongo
import logging
import datetime
from ask_sdk_model.interfaces.alexa.presentation.apl.render_document_directive import RenderDocumentDirective
from ask_sdk_core.skill_builder import SkillBuilder
from ask_sdk_core.dispatch_components import (
    AbstractRequestHandler, AbstractExceptionHandler)
from ask_sdk_core.utils import is_request_type, is_intent_name
from ask_sdk_model.dialog.confirm_slot_directive import ConfirmSlotDirective
from ask_sdk_model.dialog.delegate_directive import DelegateDirective
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.utils import is_intent_name, get_slot_value
sb = SkillBuilder()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

with open('config.json') as f:
    config = json.load(f)
    MONGODB_URI=config['MONGODB_URI']
    DB_NAME=config['DB_NAME']
    COLLECTION_NAME=config['COLLECTION_NAME']

topics = [
    "machine learning", "python",
    "database management system", 
    "data structures", "java",
    "operating systems"
]

def build_speechlet_response(output, reprompt_text, should_end_session):
    apl_document = {
        "type": "APL",
        "version": "1.7",
        "theme": "dark",
        "layouts": {
            "Body": {
                "parameters": [
                    "text"
                ],
                "items": [
                    {
                        "type": "Text",
                        "text": "${text}",
                        "textAlign": "center",
                        "fontSize": "20dp"
                    }
                ]
            }
        },
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [
                {
                    "type": "Container",
                    "width": "100%",
                    "height": "100%",
                    "justifyContent": "center",
                    "alignItems": "center",
                    "items": [
                        {
                            "type": "Text",
                            "text": "${payload.outputSpeech.text}",
                            "textAlign": "center",
                            "fontSize": "20dp"
                        }
                    ]
                }
            ]
        }
    }

    return {
        'outputSpeech': {
            'type': 'PlainText',
            'text': output
        },
        'card': {
            'title': 'Interview',
            'type': 'Standard',
            'text': output
        },
        'reprompt': {
            'outputSpeech': {
                'type': 'PlainText',
                'text': reprompt_text
            }
        },
        'shouldEndSession': should_end_session,
        'directives': [
            RenderDocumentDirective(
                document=json.dumps(apl_document),
                datasources={}
            )
        ]
    }

with open('data.json', 'r') as f:
    data=json.load(f)

class LaunchRequestHandler(AbstractRequestHandler):
    # here we welcome the user and ask for login credentials
    def can_handle(self, handler_input):
        return is_request_type("LaunchRequest")(handler_input)

    def handle(self, handler_input):
        start_time = datetime.datetime.now()
        start_time = start_time + datetime.timedelta(hours=5, minutes=30) # indian time
        handler_input.attributes_manager.session_attributes["start_time"] = str(start_time)
        speech_text = "Welcome to the virtual interview! Please enter your login ID."
        reprompt_text = "Please enter your login ID to start the interview."
        should_end_session = False
        handler_input.attributes_manager.session_attributes["status"] = "login"
        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            reprompt_text).set_card(response['card'])
        return handler_input.response_builder.response

class LoginIDIntentHandler(AbstractRequestHandler):
    # after the welcome part, ask for login id and password
    # check if the login credentials are valid
    def can_handle(self, handler_input):
        return is_intent_name("LoginIntent")(handler_input)

    def handle(self, handler_input):
        slots = handler_input.request_envelope.request.intent.slots
        loginid = slots["loginid"].value
        handler_input.attributes_manager.session_attributes["loginid"] = loginid
        speech_text = "Please enter your password."
        reprompt_text = "Please enter your password to start the interview."
        should_end_session = False
        handler_input.attributes_manager.session_attributes["status"] = "login"
        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            reprompt_text).set_card(response['card'])
        return handler_input.response_builder.response


class PasswordIntentHandler(AbstractRequestHandler):
    # after login id is entered, check if the password is valid
    # if valid, welcome the user with their name and topic
    def can_handle(self, handler_input):
        return is_intent_name("PasswordIntent")(handler_input)

    def handle(self, handler_input):
        loginid = handler_input.attributes_manager.session_attributes["loginid"]
        slots = handler_input.request_envelope.request.intent.slots
        password = slots["password"].value
        
        # check if the login credentials are valid by querying the database
        client = pymongo.MongoClient(MONGODB_URI)
        db = client['login']
        collection = db['users']
        user = collection.find_one({'ID': loginid, 'Password': password})
        
        if user is None:
            speech_text = "Sorry, the login credentials you entered are incorrect. Please try again."
            reprompt_text = "Please enter your login ID."
            should_end_session = False
        else:
            name = user['Name']
            topic = user['Topic']
            speech_text = f"Welcome {name}! Your topic is {topic}. Shall we start the interview ? You can say \"yes\" to start the interview."
            reprompt_text = "Shall we start the interview?"
            should_end_session = False
            handler_input.attributes_manager.session_attributes["name"] = name
            handler_input.attributes_manager.session_attributes["topic"] = topic
            # store id and password in session attributes
            handler_input.attributes_manager.session_attributes["loginid"] = loginid
            handler_input.attributes_manager.session_attributes["password"] = password

        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            reprompt_text).set_card(response['card'])
        return handler_input.response_builder.response


class YesNoIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("YesNoIntent")(handler_input)

    def handle(self, handler_input):
        slots = handler_input.request_envelope.request.intent.slots
        response_slot = slots["response"]
        if response_slot.value:
            response = response_slot.value.lower()
            if response == "yes":
                questions = []
                for question in data:
                    if question["topic"] == handler_input.attributes_manager.session_attributes["topic"]:
                        for i in range(1,6):
                            questions.append(question["questions"]["question"+str(i)]["question"])
                handler_input.attributes_manager.session_attributes['questions'] = questions
                for i in range(1,6):
                    handler_input.attributes_manager.session_attributes['question'+str(i)] = questions[i-1]
                question1=handler_input.attributes_manager.session_attributes['question1']
                speech_text = "First question: " + question1 + " You can say 'the first answer is' and then your answer."
                reprompt_text = "Please say 'the answer is' and then your answer."
                should_end_session = False
                response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
                handler_input.response_builder.speak(speech_text).ask(
                    speech_text).set_card(response['card'])
                return handler_input.response_builder.response
            elif response == "no":
                speech_text = "Select a topic from the below topics: \
                machine learning, database management system, data structures, operating systems, java, python. \
                You can select by saying 'topic is' and then the name of the topic."
                reprompt_text = "Please select a topic by saying 'topic is' and then the name of the topic."
                should_end_session = True
                response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
                handler_input.response_builder.speak(speech_text).set_card(response['card'])
                return handler_input.response_builder.response
            else:
                speech_text = "Sorry, I did not understand your response. Please say yes or no."
                reprompt_text = "Please say yes or no."
                should_end_session = False
                response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
                handler_input.response_builder.speak(speech_text).ask(
                    speech_text).set_card(response['card'])
                return handler_input.response_builder.response
        else:
            speech_text = "Please say yes or no."
            reprompt_text = "Please say yes or no."
            should_end_session = False
            response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
            handler_input.response_builder.speak(speech_text).ask(
                speech_text).set_card(response['card'])
            return handler_input.response_builder.response


class FirstAnswerIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("FirstAnswerIntent")(handler_input)

    def handle(self, handler_input):
        answer1 = handler_input.request_envelope.request.intent.slots["answerone"].value
        handler_input.attributes_manager.session_attributes['answer1'] = answer1
        question2=handler_input.attributes_manager.session_attributes['question2']
        speech_text = f"Second question: " + question2 + " You can say 'the second answer is' and then your answer."
        reprompt_text = "You can say next to close this interview."
        should_end_session = False

        question1=handler_input.attributes_manager.session_attributes['question1']
        answer1=handler_input.attributes_manager.session_attributes['answer1']
        answers=[]
        for question in data:
            if question["topic"] == handler_input.attributes_manager.session_attributes["topic"]:
                for i in range(1,6):
                    if question["questions"]["question"+str(i)]["question"] == question1:
                        for j in range(1,4):
                            answers.append(question["questions"]["question"+str(i)]["variation"+str(j)]["answer"])
        score1=getScore(answer1, answers)
        handler_input.attributes_manager.session_attributes['score1'] = score1

        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response

class SecondAnswerIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("SecondAnswerIntent")(handler_input)
    
    def handle(self, handler_input):
        answer2 = handler_input.request_envelope.request.intent.slots["answertwo"].value
        handler_input.attributes_manager.session_attributes['answer2'] = answer2
        question3=handler_input.attributes_manager.session_attributes['question3']
        speech_text = f"Third question: " + question3 + " You can say 'the third answer is' and then your answer."
        reprompt_text = "You can say next to close this interview."
        should_end_session = False

        question2=handler_input.attributes_manager.session_attributes['question2']
        answer2=handler_input.attributes_manager.session_attributes['answer2']
        answers=[]
        for question in data:
            if question["topic"] == handler_input.attributes_manager.session_attributes["topic"]:
                for i in range(1,6):
                    if question["questions"]["question"+str(i)]["question"] == question2:
                        for j in range(1,4):
                            answers.append(question["questions"]["question"+str(i)]["variation"+str(j)]["answer"])
        score2=getScore(answer2, answers)
        handler_input.attributes_manager.session_attributes['score2'] = score2

        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response

class ThirdAnswerIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("ThirdAnswerIntent")(handler_input)
    
    def handle(self, handler_input):
        answer3 = handler_input.request_envelope.request.intent.slots["answerthree"].value
        handler_input.attributes_manager.session_attributes['answer3'] = answer3
        question4=handler_input.attributes_manager.session_attributes['question4']
        speech_text = f"Fourth question: " + question4 + " You can say 'the fourth answer is' and then your answer."
        reprompt_text = "You can say next to close this interview."
        should_end_session = False

        question3=handler_input.attributes_manager.session_attributes['question3']
        answer3=handler_input.attributes_manager.session_attributes['answer3']
        answers=[]
        for question in data:
            if question["topic"] == handler_input.attributes_manager.session_attributes["topic"]:
                for i in range(1,6):
                    if question["questions"]["question"+str(i)]["question"] == question3:
                        for j in range(1,4):
                            answers.append(question["questions"]["question"+str(i)]["variation"+str(j)]["answer"])
        score3=getScore(answer3, answers)
        handler_input.attributes_manager.session_attributes['score3'] = score3

        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response

class FourthAnswerIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("FourthAnswerIntent")(handler_input)
    
    def handle(self, handler_input):
        answer4 = handler_input.request_envelope.request.intent.slots["answerfour"].value
        handler_input.attributes_manager.session_attributes['answer4'] = answer4
        question5=handler_input.attributes_manager.session_attributes['question5']
        speech_text = f"Last question: " + question5 + " You can say 'the fifth answer is' and then your answer."
        reprompt_text = "You can say next to close this interview."
        should_end_session = False

        question4=handler_input.attributes_manager.session_attributes['question4']
        answer4=handler_input.attributes_manager.session_attributes['answer4']
        answers=[]
        for question in data:
            if question["topic"] == handler_input.attributes_manager.session_attributes["topic"]:
                for i in range(1,6):
                    if question["questions"]["question"+str(i)]["question"] == question4:
                        for j in range(1,4):
                            answers.append(question["questions"]["question"+str(i)]["variation"+str(j)]["answer"])
        score4=getScore(answer4, answers)
        handler_input.attributes_manager.session_attributes['score4'] = score4

        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response

class FifthAnswerIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("FifthAnswerIntent")(handler_input)
    
    def handle(self, handler_input):
        answer5 = handler_input.request_envelope.request.intent.slots["answerfive"].value
        handler_input.attributes_manager.session_attributes['answer5'] = answer5
        speech_text = f"You have answered all the questions! You can say 'close interview' to close this interview."
        reprompt_text = "You can say next to close this interview."
        should_end_session = False

        question5=handler_input.attributes_manager.session_attributes['question5']
        answer5=handler_input.attributes_manager.session_attributes['answer5']
        answers=[]
        for question in data:
            if question["topic"] == handler_input.attributes_manager.session_attributes["topic"]:
                for i in range(1,6):
                    if question["questions"]["question"+str(i)]["question"] == question5:
                        for j in range(1,4):
                            answers.append(question["questions"]["question"+str(i)]["variation"+str(j)]["answer"])
        score5=getScore(answer5, answers)
        handler_input.attributes_manager.session_attributes['score5'] = score5

        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response

class CloseInterviewIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("CloseInterviewIntent")(handler_input)

    def handle(self, handler_input):
        rating = addToDB(handler_input)
        session_attributes = handler_input.attributes_manager.session_attributes
        name = session_attributes["name"]
        speech_text = f"Your score is {rating}. Thank you for your time. Goodbye {name}!"
        reprompt_text = "Goodbye!"
        should_end_session = True
        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).set_card(response['card'])
        return handler_input.response_builder.response


def getScore(stud_ans, chatgpt_ans):
    openai.api_key_path="./apikey.txt" # create a file named apikey.txt and place your api key in it
    def generatePrompt(ans1, ans2):
        return "Below is a sentence and array of strings. \
            Check if the sentence means the same as those other strings. \
            The sentence might be a much general statement of those \
            strings.\nsentence :" + ans1 + "strings :" + ans2 + "\nAnswer with rating \
            bewteen 0 to 10, it must be integers only: "

    def generate(prompt):
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=0,
            max_tokens=100,
        )
        return response
    
    ans1=stud_ans
    ans2=chatgpt_ans[0]
    prompt=generatePrompt(ans1, ans2)
    response=generate(prompt)
    rating=response["choices"][0]["text"]
    return int(rating)
    # scores=[]
    # for i in ans2:
    #     prompt=generatePrompt(ans1, i)
    #     response=generate(prompt)
    #     rating=response["choices"][0]["text"]
    #     scores.append(int(rating))
    # return max(scores)


def addToDB(handler_input):
    import pymongo
    url=MONGODB_URI
    client = pymongo.MongoClient(url)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    session_attributes = handler_input.attributes_manager.session_attributes

    topic = session_attributes["topic"]
    student_name = session_attributes["name"]
    loginid=session_attributes["loginid"]
    password=session_attributes["password"]
    
    start_time = session_attributes["start_time"]
    start_time = datetime.datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S.%f")
    start_time=start_time.strftime("%Y-%m-%d %H:%M")
    print(start_time)
    end_time=datetime.datetime.now()
    end_time=end_time+datetime.timedelta(hours=5, minutes=30) # indian time
    end_time=end_time.strftime("%Y-%m-%d %H:%M")
    print(end_time)
    end=end_time
    time_diff=datetime.datetime.strptime(end_time, "%Y-%m-%d %H:%M")-datetime.datetime.strptime(start_time, "%Y-%m-%d %H:%M")
    time_taken_float=time_diff.seconds/60
    time_taken=str(int(time_taken_float))+" minutes"
    print(time_taken)

    question1= session_attributes["question1"]
    question2= session_attributes["question2"]
    question3= session_attributes["question3"]
    question4= session_attributes["question4"]
    question5= session_attributes["question5"]
    
    answer1= session_attributes["answer1"]
    answer2= session_attributes["answer2"]
    answer3= session_attributes["answer3"]
    answer4= session_attributes["answer4"]
    answer5= session_attributes["answer5"]
    
    score1= session_attributes["score1"]
    score2= session_attributes["score2"]
    score3= session_attributes["score3"]
    score4= session_attributes["score4"]
    score5= session_attributes["score5"]

    scores=[]
    scores.append(score1)
    scores.append(score2)
    scores.append(score3)
    scores.append(score4)
    scores.append(score5)

    avg_score=sum(scores)/len(scores)
    result = {
        "studentName":student_name,
        "LoginID": loginid,
        "Password": password,
        "topic":topic,
        "questions": {
            "question1": {
                "question": question1,
                "studentAns": answer1,
                "rating": score1
            }, "question2": {
                "question": question2,
                "studentAns": answer2,
                "rating": score2
            }, "question3": {
                "question": question3,
                "studentAns": answer3,
                "rating": score3
            }, "question4": {
                "question": question4,
                "studentAns": answer4,
                "rating": score4
            }, "question5": {
                "question": question5,
                "studentAns": answer5,
                "rating": score5
            }
        },
        "startTime": start_time,
        "endTime": end,
        "duration": time_taken,
        "rating": avg_score
    }
    collection.insert_one(result)
    # print("data added to interview results db!")
    return avg_score

class StopIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.StopIntent")(handler_input)

    def handle(self, handler_input):
        session_attributes = handler_input.attributes_manager.session_attributes
        topic = session_attributes["topic"]
        answers = session_attributes["answers"]
        speech_text = f"You have answered {len(answers)} questions on {topic}. Goodbye!"
        reprompt_text = "Goodbye!"
        should_end_session = True
        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).set_card(response['card'])
        return handler_input.response_builder.response


class HelpIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.HelpIntent")(handler_input)

    def handle(self, handler_input):
        speech_text = "Welcome to the Alexa Interview Skill. You can start an interview by saying 'start interview'."
        reprompt_text = "You can start an interview by saying 'start interview'."
        should_end_session = False
        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(speech_text).ask(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response


class CancelOrStopIntentHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return (is_intent_name("AMAZON.CancelIntent")(handler_input)
                or is_intent_name("AMAZON.StopIntent")(handler_input))

    def handle(self, handler_input):
        speech_text = "Goodbye!"
        reprompt_text = "Goodbye!"
        should_end_session = True
        response = build_speechlet_response(speech_text, reprompt_text, should_end_session)
        handler_input.response_builder.speak(
            speech_text).set_card(response['card'])
        return handler_input.response_builder.response


class SessionEndedRequestHandler(AbstractRequestHandler):
    def can_handle(self, handler_input):
        return is_request_type("SessionEndedRequest")(handler_input)

    def handle(self, handler_input):
        # Any cleanup logic goes here.
        return handler_input.response_builder.response


class CatchAllExceptionHandler(AbstractExceptionHandler):
    def can_handle(self, handler_input, exception):
        return True

    def handle(self, handler_input, exception):
        logger.error(exception, exc_info=True)
        speech = "Sorry, there was some problem. Please try again!!"
        reprompt = "Sorry, there was some problem. Please try again!!"
        should_end_session = False
        response = build_speechlet_response(speech, reprompt, should_end_session)
        handler_input.response_builder.speak(speech).ask(
            speech).set_card(response['card'])
        return handler_input.response_builder.response


sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(LoginIDIntentHandler())
sb.add_request_handler(PasswordIntentHandler())
sb.add_request_handler(YesNoIntentHandler())
sb.add_request_handler(FirstAnswerIntentHandler())
sb.add_request_handler(SecondAnswerIntentHandler())
sb.add_request_handler(ThirdAnswerIntentHandler())
sb.add_request_handler(FourthAnswerIntentHandler())
sb.add_request_handler(FifthAnswerIntentHandler())
sb.add_request_handler(CloseInterviewIntentHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(CancelOrStopIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())
sb.add_exception_handler(CatchAllExceptionHandler())

lambda_handler = sb.lambda_handler()
