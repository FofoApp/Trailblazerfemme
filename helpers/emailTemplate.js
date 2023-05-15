

exports.otpTemplate = (otp, firstname) => {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <html lang="en">
    
      <head></head>
      <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">A fine-grained personal access token has been added to your account<div>
    </div>
      </div>
    
      <body style="background-color:#ffffff;color:#24292e;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;">
        <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:37.5em;width:480px;margin:0 auto;padding:20px 0 48px">
          <tr style="width:100%">
            <td>
                <!-- <img alt="FOFOAPP" src="#" width="32" height="32" style="display:block;outline:none;border:none;text-decoration:none" /> -->
              <p style="font-size:24px;line-height:1.25;margin:16px 0"><strong></strong> Dear Trailblazing ${firstname}</p>
              <table style="padding:24px;border:solid 1px #dedede;border-radius:5px;text-align:center" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                <tbody>
                  <tr>
                    <td>
                      <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Congratulations on taking another  step towards unleashing your trailblazing potential with the TrailBlazerFEMME Community App! </p>
                      <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Your unique One Time Password (OTP) is: </p>
                      <p style="font-size:32px;line-height:40px;margin:0 auto;color:#000;background-color: #f5f3f3; display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">${otp}</p> 
                      <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">With this password, you gain access to a vibrant community of like-minded women, ready to inspire, connect, and support you on your journey to success.</p>              
                      <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Should you encounter any technical hurdles, have questions, or need support, our dedicated team is here to assist you every step of the way. Drop us a line at <a href="mailto:support@trailblazerfemme.com">support@trailblazerfemme.com</a>, and we'll be more than happy to help. </p>              
                      <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Get ready to blaze those trails and make your mark! </p>
                      <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Best regards, </p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size:12px;line-height:24px;margin:16px 0;color:#6a737d;text-align:center;margin-top:20px">TrailBlazerFemme Admin</p>
            </td>
          </tr>
        </table>
      </body>
    </html> `;
}