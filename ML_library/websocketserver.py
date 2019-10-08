import asyncio
import websockets
import datetime
from pymongo import MongoClient
import os
from configure import config
from urllib.parse import unquote

mongo_client = MongoClient(os.getenv('MONGODB_HOST', 'localhost'))
db = mongo_client[config['mongo']['dbName']]

async def connect(websocket, path):
    # If the path is too short, abort
    if len(path) < len("/api/video/"):
        websocket.close()
        return

    # Split url into parts
    urlParts = path[len("/api/video/"):].split('/')
    # So the full URL starts with /api/video, but we're ignoring that.

    # If the path is still too short, abort
    if len(urlParts) < 4:
        websocket.close()
        return

    # Remove the user's ID from the URL
    user_id = urlParts.pop(0)
    # Remove the session cookie from the URL
    session_cookie = urlParts.pop(0)
    # Check if this user actually exists by attempting to get their _id. If they don't, abort
    # TODO: update this to work with the new sessions collection
    try:
        db.users.find_one({"_id": user_id, "sessionCookie": unquote(session_cookie)})["_id"]
    except:
        websocket.close()
        return


    # Now what's left in urlParts is e.g. /groupID/projectID/lectureID/extension
    # Or, you can omit lectureID and just have /groupID/projectID/extension
    # Or, you can omit lectureID and projectID and just have /groupID/extension
    # extension will be mp4/mp3/avi/mov/etc.
    # The IDs (like groupID) will be some string like "abcdefghi1234567"

    extension = urlParts[len(urlParts) - 1]

    # Obtain the current time
    now = datetime.datetime.now()

    # JSON to put into mongo later
    putInDB = {
        "extension": extension,
        "uploadedBy": user_id,
        "uploadedAt": now
    }

    # Depending on length of the parts, different ID will be used
    if len(urlParts) == 4:
        putInDB["lectureID"] = urlParts[2]
    elif len(urlParts) == 3:
        putInDB["projectID"] = urlParts[1]
    else:
        putInDB["groupID"] = urlParts[0]

    # Connect with mongo and insert the previous JSON object into the videos collection
    result = db['videos'].insert_one(putInDB)
    videoID = result.inserted_id

    # Send the videoID that was just recorded
    await websocket.send(str(videoID))

    # Path to save the video
    path = config['uploadsDir'] + '/' + str(videoID) + '.' + extension
    # TODO:
    # receive data, then append it to the file at path
    while True:
        try:
            data = await websocket.recv()
        except Exception as e:
            print("Ignoring error", e)
            try:
                websocket.close()
            finally:
                break
        else:
            f = open(path, 'a+')
            f.write(data)
        # TODO: Send data receive through extract frame/audio function


def start_server():
    asyncio.set_event_loop(asyncio.new_event_loop())
    start_server = websockets.serve(connect, '0.0.0.0', 5678)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
