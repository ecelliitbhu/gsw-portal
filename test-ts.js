async function check() {
  const url = "https://www.townscript.com/api/registration/getRegisteredUsers?eventCode=techstars-startup-weekend26-312134";
  const auth = "eyJhbGciOiJIUzUxMiJ9.eyJST0xFIjoiUk9MRV9VU0VSIiwic3ViIjoiZWNlbGxAaXRiaHUuYWMuaW4iLCJhdWRpZW5jZSI6IndlYiIsImNyZWF0ZWQiOjE3ODI5MDI1OTQxMzksIk1BR0lDX0xPR0lOIjpmYWxzZSwiVVNFUl9JRCI6MzM1MDQ5NywiZXhwIjoxNzkwNjc4NTk0fQ.-xdf3X1xdRCCSuLgH5irPQEL3wCKNBggD03VWD1sj4hZ9QvUtUgKmc8K4j5p1zFlSiFkgK8-SlyvJ2tWpbfobQ";

  console.log("Fetching...", url);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: auth
    }
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text.substring(0, 1000));
}

check();
