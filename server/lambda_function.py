#!/usr/bin/python
import re
from bs4 import BeautifulSoup
from mechanize import Browser

def lambda_handler(event, context):
    br = Browser()

    # Ignore robots.txt
    br.set_handle_robots(False)

    br.addheaders = [('User-agent', 'Firefox')]

    # Retrieve the gasbuddy homepage
    br.open( "http://gasbuddy.com")

    #select the search form
    br.form = list(br.forms())[0]

    #find the text input and set postal code and submit form
    for control in br.form.controls:
        if control.type=='text':
            control.value = event['postal_code']
            print(event['postal_code'])
    resp = br.submit()

    soup = BeautifulSoup(resp, 'html.parser')
    avg_price_tag = soup.find("h4", text=re.compile(r'Average Price'))
    avg_price = avg_price_tag.findNext('div').contents[0].strip()
    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": avg_price,
        "request": event
    }
