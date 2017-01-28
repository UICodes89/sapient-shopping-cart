(function(app){

	app.directive("shopCart", function($http, $timeout){
		
		return{
			restrict:'E',
			templateUrl:'./templates/shoppingcart.html',
			replace:true,
			controller:function($scope){
                $scope.products,
                $scope.grandTotal = 0,
                $scope.coupanName,
                $scope.dicountedPrice = 0;
                $scope.set = function(data){
                	$scope.products = data;
                  console.log($scope.products);
                }
                $scope.editItem = function(product){
                   $scope.$broadcast("editItem", product);
                }
                $scope.saveItem = function(product){
                  var cart = {};
                   cart.products = []; 
                   var getSaveCart = JSON.parse(localStorage.getItem("data"));
                   
                  if(getSaveCart){
                    for(var i=0; i<getSaveCart.products.length;i++){
                      if(getSaveCart.products[i].p_id == product.p_id){

                        if(angular.equals(getSaveCart.products[i], product)){
                           $scope.$broadcast('itemAlreadySaved', true);
                        }else{
                            getSaveCart.products[i] = product;
                            localStorage.setItem("data" , JSON.stringify(getSaveCart));
                            $scope.$broadcast('itemSaved', true);
                        }

                      }else{
                        if(i == getSaveCart.products.length-1){
                          getSaveCart.products.push(product)
                          localStorage.setItem("data" , JSON.stringify(getSaveCart));
                          $scope.$broadcast('itemSaved', true);
                          break;
                        }
                      }
                    }

                  }else{
                    cart.products.push(product);
                    localStorage.setItem("data" , JSON.stringify(cart));
                    $scope.$broadcast('itemSaved', true);
                  }
                }
                $scope.removeProduct= function(product){
                	
                   for(var i=0; i<$scope.products.productsInCart.length; i++){
                   	
                		if($scope.products.productsInCart[i].p_id == product.p_id){
                		   $scope.products.productsInCart.splice(i, 1);	
                           $scope.grantTotal();
                		}
                	}		
                }
                $scope.updatecart = function(item){
                	for(var i=0; i<$scope.products.productsInCart.length; i++){
                		if($scope.products.productsInCart[i].p_id == item.p_id){
                			  $scope.products.productsInCart[i].p_selected_size.name = item.p_selected_size.name;
                			  $scope.products.productsInCart[i].p_selected_size.code = item.p_selected_size.code;
                			  $scope.products.productsInCart[i].p_quantity = item.p_quantity;
                        $scope.products.productsInCart[i].p_selected_color.name = item.p_selected_color.name;
                        $scope.products.productsInCart[i].p_selected_color.hexcode = item.p_selected_color.hexcode;
                		}
                    }
                }
                $scope.$on('oneditcart', function(e, item){
                   $scope.updatecart(item);
                   $scope.grantTotal();
                });
                $scope.$on('onremoveItem', function(e, item){
                   $scope.removeProduct(item);
                });
                $scope.grantTotal = function(){
                    $scope.grandTotal=0,
                    $scope.dicountedPrice=0,
                    $scope.coupanName = '',
                    $scope.total = 0;
                    var temp = $scope.products.productsInCart;
                    
                    for(var i=0; i<temp.length; i++){
                       $scope.total += temp[i].p_quantity*temp[i].p_price;
                    }
                    $scope.grandTotal = $scope.total;
                    if(temp.length == 3){
                        $scope.grandTotal = $scope.total - $scope.total *(5/100);
                        $scope.coupanName = "JF5";
                        $scope.dicountedPrice = $scope.total *(5/100);
                    } else if(temp.length >3 && temp.length<=6){
                        $scope.grandTotal = $scope.total - $scope.total *(10/100);
                        $scope.coupanName = "JF10";
                        $scope.dicountedPrice = $scope.total *(10/100);
                    }  else if(temp.length >10){
                        $scope.grandTotal = $scope.total - $scope.total *(25/100);
                        $scope.coupanName = "JF25";
                        $scope.dicountedPrice = $scope.total *(25/100);
                    }                   
                 
                }
                

			},
			link:function(scope, element, attributes){
				
                $http.get('../json/cart.json').success(function(response){
                    //check localstorage data
                    var savelocalData = JSON.parse(localStorage.getItem('data'));
                   

                    if(savelocalData){
                        
                        for(var i=0; i<response.productsInCart.length;i++){
                            for(var j=0;j<savelocalData.products.length;j++){
                                if(response.productsInCart[i].p_id == savelocalData.products[j].p_id){
                                    if(!angular.equals(response.productsInCart[i], savelocalData.products[j])){
                                       
                                       response.productsInCart[i] = savelocalData.products[j];

                                   }
                                   
                                }
                            }
                        }
                    }
                    //console.log(response.productsInCart);
                	  scope.set(response);
                    scope.grantTotal();
                });

                scope.$on('itemSaved', function(){
                    element.append('<div class="saveItemMsg">Item is saved </div>');
                    $timeout(function () {
                          angular.element(document.querySelector('.saveItemMsg')).remove();
                    }, 2000);
                });

                scope.$on('itemAlreadySaved', function(){
                    element.append('<div class="saveItemMsg">Item is Already saved </div>');
                    $timeout(function () {
                          angular.element(document.querySelector('.saveItemMsg')).remove();
                    }, 2000);
                });
                

                
            }
		}
	});

    app.directive('editBlock', function(){
    	return{
    		restrict:"E",
    		templateUrl:'./templates/editBlock.html',
    		replace:true,
    		controller:function($scope){
    			$scope.product;
    			$scope.close=function(){

                   	 angular.element(document.querySelector('#myModal')).removeClass("show");
                   	 angular.element(document.querySelector('.modal-backdrop')).removeClass('in').addClass('out');
    			}
    			$scope.open=function(){

                   	 angular.element(document.querySelector('#myModal')).addClass('show');
                     angular.element(document.querySelector('.modal-backdrop')).removeClass('out').addClass('in');
    			}

    			$scope.editcartItem =function(item){
                     $scope.product = item;
                     $scope.$emit('oneditcart', $scope.product);
                     $scope.close();
    			}
                $scope.changecolor = function(product, color, hexcode){
                  product.p_selected_color.name=color;
                  product.p_selected_color.hexcode=hexcode;
                }
                $scope.items=[
                   {name: 'QTY 1', value: 1},
                   {name: 'QTY 2', value: 2},
                   {name: 'QTY 3', value: 3},
                   {name: 'QTY 4', value: 4},
                   {name: 'QTY 5', value: 5},
                ];


    		},
    		link:function(scope, element, attributes, shopCart){

                scope.$on('editItem', function(e, product){
                     scope.product = angular.copy(product);
                     scope.open();
                     angular.element(document.querySelector('.close')).on("click", function(){
                     scope.close();
                });
                
              });

    		}


    	}
    });

}(app));