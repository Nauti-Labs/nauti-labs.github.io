# Wheaton Creek Ranch click counts

When someone taps a Nauti-Labs link to the ranch, they land on a short stop first. That stop writes down the click, then sends them to the ranch website. You do not have to do anything when a person clicks. The count happens on its own.

## How to see the clicks

1. Sign in to GoatCounter.
2. Open the Nauti-Labs site inside GoatCounter.
3. Look at **Events**, not the regular page list.
4. The event is named `/go/wheaton-creek`.
5. A link that says where it was posted shows that place after the path. A YouTube click is `/go/wheaton-creek/youtube`. An X click is `/go/wheaton-creek/x`. The homepage footer is `/go/wheaton-creek/footer`.

If the events list stays empty, the count address is still the placeholder. Open `go/wheaton-creek/index.html` and find `GOATCOUNTER_ENDPOINT` at the top. Replace it with the count address GoatCounter shows you. It looks like `https://your-code.goatcounter.com/count`. The placeholder sitting there now is `https://nautilabs.goatcounter.com/count`.

## Links ready to paste

YouTube bio or video description:

https://nauti-labs.com/go/wheaton-creek/?src=youtube

X bio:

https://nauti-labs.com/go/wheaton-creek/?src=x

A link with no `src` still counts. It shows up as `/go/wheaton-creek`.
