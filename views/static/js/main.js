
//to restore all to the original values

  $("#clearAll").on("click", function () {

    $("#jobName").val("");
    $('#description').val("");
    $("#payment1").prop("checked", false);
    $("#payment2").prop("checked", false);
    $("#payment3").prop("checked", false);3
    $("#options").val("Select");
    $("#startDate").val("");
    $("#endDate").val("");
    $("#upload").val("");

  })

  //to uncheck the other options

  $("#payment1").on("click", function () {

    $("#payment2").prop("checked", false);
    $("#payment3").prop("checked", false);

  })
  $("#payment2").on("click", function () {

    $("#payment1").prop("checked", false);
    $("#payment3").prop("checked", false);

  })

  $("#payment3").on("click", function () {

    $("#payment1").prop("checked", false);
    $("#payment2").prop("checked", false);

  })

  //to manage the Job Type

  $("#job").change(function () {

    var jobType = $("#job").children("option:selected").val();
    if (jobType == 'IT') {
      $("#jobType").text("IT");
    } else if (jobType == 'Business'){
      $("#jobType").text("Business");
    } else {
      $("#jobType").text("All Jobs");
    }
  })

  //trying to do a search box example

  $(function () {
    var availableTags = [
      "IBM",
      "Sony"
    ];
    $("#tags").autocomplete({
      source: availableTags
    });

  });

  $("#tags").change(function () {

    var companySelected = $("#tags").text();
    var companyName1 = $("#companyName1").text();
  

    if (companySelected == companyName1) {

      alert(companyName1)

      $("#job2").hide();
      $("#job1").show();

    }

  })