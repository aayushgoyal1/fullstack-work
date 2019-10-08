from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
import os
from configure import config
from PIL import Image

watchdir = config['processing']['frames']['outputDir']

def create_q1_data(path):
    filename = os.path.basename(path)
    videoID, frame_num, _ = filename.split('.')
    frame = Image.open(watchdir + '/' + filename)
    return {
        "videoID": videoID,
        "frame_num": frame_num,
        "frame": frame,
        "path": path
    }

# This will become a lambda later
add_to_q1 = 0

class Handler(FileSystemEventHandler):
    """
    Whenever a frame is created (signaling that ffmpeg has finished writing it),
    the path to the frame is appended to the queue for batch processing
    """
    @staticmethod
    def on_modified(event):
        if not event.is_directory and os.path.isfile(event.src_path):
            add_to_q1(event.src_path)

# watcher in itself is a thread, so when a new frame is modified
# in the directory, add it into q1
def start_watcher(q1, q2):
    global add_to_q1
    add_to_q1 = lambda path: q1.put(create_q1_data(path))

    # Make sure the directory we're watching exists
    os.makedirs(watchdir, exist_ok=True)

    # Add any frames that weren't already processed to the queue
    list(map(lambda filename: add_to_q1(watchdir + '/' + filename), os.listdir(watchdir)))

    # Setup the watcher
    observer = Observer()
    event_handler = Handler()
    observer.schedule(event_handler, watchdir)
    observer.start()

    print("Watching for frames in", watchdir)
