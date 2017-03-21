while [ : ]   # run forever
do
    # Take a picture, 100ms delay, 400x300, 80% quality, no preview
    raspistill -t 100 -w 400 -h 300 -q 80 -o image.jpg -n
    # upload to the server using curl
    curl -F "image=@image.jpg" 'http://example.com:8080/upload'
    # print out a confirmation
    echo "picture uploaded"
    # sleep for 30 seconds
    sleep 30
done
