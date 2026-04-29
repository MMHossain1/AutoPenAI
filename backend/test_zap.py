from backend.app.service.scan_client import Scan_Client
from pprint import pprint

# to find your API Key, open ZAP -> Tools -> Options -> API -> API Key
testAppClient = Scan_Client(
    "https://public-firing-range.appspot.com/urldom",
    "dukstjg1erdir59c53e39bvdrs",
)

# Manual testing only — do not run automatically in CI

print("\n".join(testAppClient.spider()))
testAppClient.ascan()
results = testAppClient.ascanResults(risk_level=3, confidence_level=1)
pprint(testAppClient.alertFormatAI(results))
# testAppClient.clearAlerts()
