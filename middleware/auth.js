const userLogin = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  };
  
  const userLogout = (req, res,next) => {
    if(req.session.user)
        {
          req.session.user = false;
          req.session.destroy();
          userData = undefined;
          res.redirect("/");
            
        }
        else{
            next();

        }
  };
  
  // admin


  const adminLogin = (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin");
    }
  };
  
  const adminLogout = (req, res) => {
    req.session.admin = false;
    // req.session.destroy();
    res.redirect("/admin");
  };
  module.exports ={ userLogin,userLogout,adminLogin,adminLogout}